import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:better_auth_flutter/src/core/local_storage/kv_store.dart';
import 'package:better_auth_flutter/src/core/local_storage/kv_store_keys.dart';

/// Better Auth returns `token` + `user` on `/sign-in/email` and `/sign-in/social`
/// (see server `sign-in.mjs`). The stock `better_auth_flutter` client ignores
/// `token` and only uses cookies for `/get-session`, which often fails on
/// Android emulators — then [AuthSessionController] cannot verify a session.
Future<(User?, BetterAuthFailure?)> nativeSignInWithEmail({
  required String email,
  required String password,
}) async {
  try {
    final (result, error) = await Api.sendRequest(
      AppEndpoints.signInWithEmailAndPassword,
      method: MethodType.post,
      body: {'email': email, 'password': password},
    );
    if (error != null) return (null, error);
    if (result is! Map<String, dynamic>) {
      return (
        null,
        BetterAuthFailure(code: BetterAuthError.unKnownError),
      );
    }
    return _hydrateAfterSignInResponse(result);
  } catch (e) {
    return (
      null,
      BetterAuthFailure(
        code: BetterAuthError.unKnownError,
        message: e.toString(),
      ),
    );
  }
}

Future<(User?, BetterAuthFailure?)> nativeSignInWithIdToken({
  required SocialProvider provider,
  required String idToken,
  required String accessToken,
}) async {
  try {
    final (result, error) = await Api.sendRequest(
      AppEndpoints.socialSignIn,
      method: MethodType.post,
      body: {
        'provider': provider.id,
        'idToken': {
          'token': idToken,
          'accessToken': accessToken,
        },
        'disableRedirect': true,
      },
    );
    if (error != null) return (null, error);
    if (result is! Map<String, dynamic>) {
      return (
        null,
        BetterAuthFailure(code: BetterAuthError.invalidResponse),
      );
    }
    return _hydrateAfterSignInResponse(result);
  } catch (e) {
    return (
      null,
      BetterAuthFailure(
        code: BetterAuthError.unKnownError,
        message: e.toString(),
      ),
    );
  }
}

/// Same JSON shape as sign-in when a session is created (`token` + `user`).
Future<(User?, BetterAuthFailure?)> nativeHydrateAfterAuthResponse(
  Map<String, dynamic> result,
) =>
    _hydrateAfterSignInResponse(result);

Future<(User?, BetterAuthFailure?)> _hydrateAfterSignInResponse(
  Map<String, dynamic> result,
) async {
  final token = result['token'] as String?;
  final userRaw = result['user'];
  if (userRaw is! Map<String, dynamic>) {
    return (
      null,
      BetterAuthFailure(code: BetterAuthError.invalidResponse),
    );
  }

  if (token != null && token.isNotEmpty) {
    final (sessBody, sessErr) = await Api.sendRequest(
      AppEndpoints.getSession,
      method: MethodType.get,
      headers: <String, String>{
        'Authorization': 'Bearer $token',
      },
    );
    if (sessErr == null && sessBody is Map<String, dynamic>) {
      final sessionRaw = sessBody['session'];
      final userMap = sessBody['user'];
      if (sessionRaw is Map<String, dynamic> &&
          userMap is Map<String, dynamic>) {
        try {
          final session = Session.fromMap(sessionRaw);
          final user = User.fromMap(userMap);
          await _persistClientSession(session: session, user: user);
          return (user, null);
        } catch (_) {
          // Fall through to cookie-based get-session.
        }
      }
    }
  }

  try {
    final u = User.fromMap(userRaw);
    BetterAuth.instance.client.user = u;
  } catch (e) {
    return (
      null,
      BetterAuthFailure(
        code: BetterAuthError.unKnownError,
        message: e.toString(),
      ),
    );
  }

  final (pair, fail) = await BetterAuth.instance.client.getSession();
  if (fail == null && pair != null) {
    final s = pair.$1;
    final u = pair.$2;
    if (s != null &&
        u != null &&
        s.token.isNotEmpty &&
        u.id.isNotEmpty) {
      await _persistClientSession(session: s, user: u);
      return (u, null);
    }
  }

  return (
    null,
    BetterAuthFailure(
      code: BetterAuthError.unKnownError,
      message:
          'Signed in but could not load session (token/cookies). Check API base URL.',
    ),
  );
}

Future<void> _persistClientSession({
  required Session session,
  required User user,
}) async {
  BetterAuth.instance.client.session = session;
  BetterAuth.instance.client.user = user;
  await KVStore.set(KVStoreKeys.user, user.toJson());
  await KVStore.set(KVStoreKeys.session, session.toJson());
}
