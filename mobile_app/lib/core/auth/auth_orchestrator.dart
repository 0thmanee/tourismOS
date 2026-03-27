import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import '../config/app_env.dart';
import '../state/launch_controller.dart';
import 'better_auth_session.dart';

enum EmailSignupResult { signedIn, verificationRequired }
enum AuthStatus { unknown, unauthenticated, guest, authenticated }

class AuthOrchestrator extends ChangeNotifier {
  bool _isLoading = false;
  String? _error;
  bool _isBootstrapping = false;
  bool _hasCheckedSession = false;
  AuthStatus _authStatus = AuthStatus.unknown;

  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isBootstrapping => _isBootstrapping;
  bool get hasCheckedSession => _hasCheckedSession;
  AuthStatus get authStatus => _authStatus;

  void _setStatus(AuthStatus status) {
    _authStatus = status;
    notifyListeners();
  }

  void _setLoading(bool value) {
    if (_isLoading == value) return;
    _isLoading = value;
    notifyListeners();
  }

  Never _fail(String message) {
    _error = message;
    notifyListeners();
    throw Exception(message);
  }

  Future<void> _completeAuth(LaunchController launch) async {
    await launch.setSessionReady(guest: false);
    await refreshBetterAuthClientSession();
    await syncLaunchSessionFromBetterAuth(launch);
    if (!launch.sessionReady || launch.isGuest) {
      _fail('Signed in, but failed to verify active session.');
    }
    _hasCheckedSession = true;
    _setStatus(AuthStatus.authenticated);
  }

  Future<void> bootstrap(LaunchController launch) async {
    if (_isBootstrapping) return;
    _isBootstrapping = true;
    notifyListeners();
    try {
      await launch.load();
      if (launch.isGuest) {
        _hasCheckedSession = true;
        _setStatus(AuthStatus.guest);
        return;
      }
      // Always attempt real session discovery (cookie jar / persisted BetterAuth session),
      // even if local flags were cleared.
      await syncLaunchSessionFromBetterAuth(launch);
      if (launch.sessionReady && !launch.isGuest && BetterAuth.instance.client.user != null) {
        _hasCheckedSession = true;
        _setStatus(AuthStatus.authenticated);
      } else {
        _hasCheckedSession = true;
        _setStatus(AuthStatus.unauthenticated);
      }
    } catch (e) {
      // Never allow bootstrap errors to pin the router on /splash.
      _error = e.toString();
      _hasCheckedSession = true;
      _setStatus(AuthStatus.unauthenticated);
    } finally {
      _isBootstrapping = false;
      notifyListeners();
    }
  }

  Future<void> syncSession(LaunchController launch) async {
    _setLoading(true);
    _error = null;
    try {
      await syncLaunchSessionFromBetterAuth(launch);
      _hasCheckedSession = true;
      final hasToken = (BetterAuth.instance.client.session?.token ?? '').isNotEmpty;
      if (launch.sessionReady &&
          !launch.isGuest &&
          hasToken &&
          BetterAuth.instance.client.user != null) {
        _setStatus(AuthStatus.authenticated);
      } else if (launch.isGuest) {
        _setStatus(AuthStatus.guest);
      } else {
        _setStatus(AuthStatus.unauthenticated);
      }
    } finally {
      _setLoading(false);
    }
  }

  Future<void> continueAsGuest(LaunchController launch) async {
    _setLoading(true);
    _error = null;
    try {
      // Guest must be a hard boundary: no leftover authenticated session/token.
      BetterAuth.instance.client.session = null;
      BetterAuth.instance.client.user = null;
      await launch.setSessionReady(guest: true);
      _hasCheckedSession = true;
      _setStatus(AuthStatus.guest);
    } finally {
      _setLoading(false);
    }
  }

  Future<void> signInWithEmail({
    required LaunchController launch,
    required String email,
    required String password,
  }) async {
    _setLoading(true);
    _error = null;
    try {
      final (user, err) = await BetterAuth.instance.client.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      if (err != null) _fail(err.message);
      if (user == null) _fail('Sign in failed.');
      await _completeAuth(launch);
    } finally {
      _setLoading(false);
    }
  }

  Future<EmailSignupResult> signUpWithEmail({
    required LaunchController launch,
    required String name,
    required String email,
    required String password,
  }) async {
    _setLoading(true);
    _error = null;
    try {
      final (_, err) = await BetterAuth.instance.client.signUpWithEmailAndPassword(
        email: email,
        password: password,
        name: name,
      );
      if (err != null) _fail(err.message);

      final (pair, sessErr) = await BetterAuth.instance.client.getSession();
      if (sessErr != null || pair == null || pair.$2 == null) {
        return EmailSignupResult.verificationRequired;
      }

      final (session, user) = pair;
      BetterAuth.instance.client.session = session;
      BetterAuth.instance.client.user = user;
      await _completeAuth(launch);
      return EmailSignupResult.signedIn;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> signInWithGoogle(LaunchController launch) async {
    if (AppEnv.googleServerClientId.isEmpty) {
      _fail('Add GOOGLE_SERVER_CLIENT_ID (web OAuth client) via --dart-define.');
    }
    _setLoading(true);
    _error = null;
    try {
      final google = GoogleSignIn(serverClientId: AppEnv.googleServerClientId);
      await google.signOut();
      final account = await google.signIn();
      if (account == null) return;
      final auth = await account.authentication;
      final idToken = auth.idToken;
      final accessToken = auth.accessToken;
      if (idToken == null ||
          idToken.isEmpty ||
          accessToken == null ||
          accessToken.isEmpty) {
        _fail('Google Sign-In did not return tokens.');
      }
      final (_, err) = await BetterAuth.instance.client.signInWithIdToken(
        provider: SocialProvider.google,
        idToken: idToken,
        accessToken: accessToken,
      );
      if (err != null) _fail(err.message);
      await _completeAuth(launch);
    } on PlatformException catch (e) {
      final code = e.code.toLowerCase();
      final message = (e.message ?? '').toLowerCase();
      final isNetworkIssue = code.contains('network_error') || message.contains('network');
      final isConfigIssue = code.contains('10') ||
          code.contains('sign_in_failed') ||
          message.contains('developer_error') ||
          message.contains('apiexception: 10');
      if (isNetworkIssue) {
        _fail(
          'GOOGLE_NETWORK_ERROR: Unable to reach Google services. '
          'Check emulator internet/Play Services and try again.',
        );
      }
      if (isConfigIssue) {
        _fail(
          'GOOGLE_CONFIG_ERROR: Google Sign-In configuration issue. '
          'Verify Android package + SHA-1 and OAuth client setup.',
        );
      }
      _fail('Google Sign-In failed: ${e.message ?? e.code}');
    } finally {
      _setLoading(false);
    }
  }

  Future<void> signInWithApple(LaunchController launch) async {
    _setLoading(true);
    _error = null;
    try {
      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );
      final idToken = credential.identityToken;
      final code = credential.authorizationCode;
      if (idToken == null || idToken.isEmpty || code.isEmpty) {
        _fail('Sign in with Apple did not return tokens.');
      }
      final (_, err) = await BetterAuth.instance.client.signInWithIdToken(
        provider: SocialProvider.apple,
        idToken: idToken,
        accessToken: code,
      );
      if (err != null) _fail(err.message);
      await _completeAuth(launch);
    } finally {
      _setLoading(false);
    }
  }

  Future<void> signOutAll(LaunchController launch) async {
    _setLoading(true);
    _error = null;
    try {
      await signOutAndWipeEverything(launch);
      try {
        await GoogleSignIn().disconnect();
      } catch (_) {}
      try {
        await GoogleSignIn().signOut();
      } catch (_) {}
      _hasCheckedSession = true;
      _setStatus(AuthStatus.unauthenticated);
    } finally {
      _setLoading(false);
    }
  }
}
