import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import '../config/app_env.dart';
import '../state/launch_controller.dart';
import '../state/launch_controller_provider.dart';
import 'better_auth_native_sign_in.dart';
import 'better_auth_sync.dart';

enum EmailSignupResult { signedIn, verificationRequired }

enum AuthStatus { unknown, unauthenticated, guest, authenticated }

/// Single place for **auth session** lifecycle: bootstrap, sign-in/out, guest, and prefs sync.
///
/// Reads [LaunchController] via [Ref] so call sites do not pass `launch` into every method.
/// Better Auth client + Dio still use [BetterAuth.instance] for transport; this class owns
/// **routing-relevant** [AuthStatus] and coordinates SharedPreferences flags.
class AuthSessionController extends ChangeNotifier {
  AuthSessionController(this._ref);

  final Ref _ref;

  LaunchController get _launch => _ref.read(launchControllerProvider);

  bool _isLoading = false;
  String? _error;
  bool _isBootstrapping = false;
  bool _hasCheckedSession = false;
  AuthStatus _authStatus = AuthStatus.unknown;
  Future<void>? _bootstrapInFlight;

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

  /// Prefs say “not in app” but in-memory [AuthStatus] still says guest/authenticated —
  /// common after hot reload or dev reset that cleared prefs without touching this notifier.
  void _healStaleAuthStatus() {
    if (_launch.sessionReady || _launch.isGuest) return;
    final hasClient = BetterAuth.instance.client.user != null &&
        (BetterAuth.instance.client.session?.token ?? '').isNotEmpty;
    if (hasClient) return;
    if (_authStatus == AuthStatus.guest ||
        _authStatus == AuthStatus.authenticated) {
      _setStatus(AuthStatus.unauthenticated);
    }
  }

  Future<void> _completeSignIn() async {
    // Let Better Auth persist cookies / client before re-querying get-session.
    await Future<void>.delayed(const Duration(milliseconds: 200));
    await refreshBetterAuthClientSession();
    await applyLaunchPrefsFromBetterAuth(_launch);
    if (!_launch.sessionReady || _launch.isGuest) {
      await Future<void>.delayed(const Duration(milliseconds: 450));
      await refreshBetterAuthClientSession();
      await applyLaunchPrefsFromBetterAuth(_launch);
    }
    if (!_launch.sessionReady || _launch.isGuest) {
      await Future<void>.delayed(const Duration(milliseconds: 700));
      await refreshBetterAuthClientSession();
      await applyLaunchPrefsFromBetterAuth(_launch);
      if (!_launch.sessionReady || _launch.isGuest) {
        _fail('Signed in, but failed to verify active session.');
      }
    }
    _hasCheckedSession = true;
    _setStatus(AuthStatus.authenticated);
  }

  /// Idempotent cold start / splash: safe to await from multiple callers.
  Future<void> bootstrap() {
    _bootstrapInFlight ??= _runBootstrap().whenComplete(() {
      _bootstrapInFlight = null;
    });
    return _bootstrapInFlight!;
  }

  Future<void> _runBootstrap() async {
    _isBootstrapping = true;
    notifyListeners();
    try {
      await _launch.load();
      _healStaleAuthStatus();
      if (_launch.isGuest) {
        _hasCheckedSession = true;
        _setStatus(AuthStatus.guest);
        return;
      }
      await applyLaunchPrefsFromBetterAuth(_launch);
      if (_launch.sessionReady &&
          !_launch.isGuest &&
          BetterAuth.instance.client.user != null) {
        _hasCheckedSession = true;
        _setStatus(AuthStatus.authenticated);
      } else {
        _hasCheckedSession = true;
        _setStatus(AuthStatus.unauthenticated);
      }
    } catch (e) {
      _error = e.toString();
      _hasCheckedSession = true;
      _setStatus(AuthStatus.unauthenticated);
    } finally {
      _isBootstrapping = false;
      notifyListeners();
    }
  }

  /// Reconcile prefs + client after profile / password updates.
  Future<void> syncSession() async {
    _setLoading(true);
    _error = null;
    try {
      await _launch.load();
      _healStaleAuthStatus();
      await applyLaunchPrefsFromBetterAuth(_launch);
      _hasCheckedSession = true;
      final hasToken =
          (BetterAuth.instance.client.session?.token ?? '').isNotEmpty;
      if (_launch.sessionReady &&
          !_launch.isGuest &&
          hasToken &&
          BetterAuth.instance.client.user != null) {
        _setStatus(AuthStatus.authenticated);
      } else if (_launch.isGuest) {
        _setStatus(AuthStatus.guest);
      } else {
        _setStatus(AuthStatus.unauthenticated);
      }
    } finally {
      _setLoading(false);
    }
  }

  Future<void> continueAsGuest() async {
    _setLoading(true);
    _error = null;
    try {
      BetterAuth.instance.client.session = null;
      BetterAuth.instance.client.user = null;
      await _launch.setSessionReady(guest: true);
      _hasCheckedSession = true;
      _setStatus(AuthStatus.guest);
    } finally {
      _setLoading(false);
    }
  }

  Future<void> signInWithEmail({
    required String email,
    required String password,
  }) async {
    _setLoading(true);
    _error = null;
    try {
      final (user, err) = await nativeSignInWithEmail(
        email: email,
        password: password,
      );
      if (err != null) _fail(err.message);
      if (user == null) _fail('Sign in failed.');
      await _completeSignIn();
    } finally {
      _setLoading(false);
    }
  }

  Future<EmailSignupResult> signUpWithEmail({
    required String name,
    required String email,
    required String password,
  }) async {
    _setLoading(true);
    _error = null;
    try {
      final (raw, err) =
          await BetterAuth.instance.client.signUpWithEmailAndPassword(
        email: email,
        password: password,
        name: name,
      );
      if (err != null) _fail(err.message);
      if (raw == null) _fail('Sign up failed.');

      final token = raw['token'] as String?;
      if (token == null || token.isEmpty) {
        return EmailSignupResult.verificationRequired;
      }

      final (user, hErr) = await nativeHydrateAfterAuthResponse(raw);
      if (hErr != null) _fail(hErr.message);
      if (user == null) _fail('Sign up failed.');
      await _completeSignIn();
      return EmailSignupResult.signedIn;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> signInWithGoogle() async {
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
      final (_, err) = await nativeSignInWithIdToken(
        provider: SocialProvider.google,
        idToken: idToken,
        accessToken: accessToken,
      );
      if (err != null) _fail(err.message);
      await _completeSignIn();
    } on PlatformException catch (e) {
      final code = e.code.toLowerCase();
      final message = (e.message ?? '').toLowerCase();
      final isNetworkIssue =
          code.contains('network_error') || message.contains('network');
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

  Future<void> signInWithApple() async {
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
      final (_, err) = await nativeSignInWithIdToken(
        provider: SocialProvider.apple,
        idToken: idToken,
        accessToken: code,
      );
      if (err != null) _fail(err.message);
      await _completeSignIn();
    } finally {
      _setLoading(false);
    }
  }

  Future<void> signOutAll() async {
    _setLoading(true);
    _error = null;
    try {
      await signOutAndWipeEverything(_launch);
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
