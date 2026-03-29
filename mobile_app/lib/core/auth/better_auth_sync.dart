import 'package:better_auth_flutter/better_auth_flutter.dart';

import '../state/launch_controller.dart';
import 'auth_backend_api.dart';

DateTime _parseDateTime(dynamic value) {
  if (value is String) return DateTime.parse(value);
  if (value is int) return DateTime.fromMillisecondsSinceEpoch(value);
  if (value is double) {
    return DateTime.fromMillisecondsSinceEpoch(value.toInt());
  }
  throw const FormatException('Invalid datetime value');
}

Future<(Session, User)?> _hydrateSessionFromRawGetSession() async {
  try {
    final (result, error) = await Api.sendRequest(
      AppEndpoints.getSession,
      method: MethodType.get,
    );
    if (error != null || result is! Map<String, dynamic>) return null;
    final sessionRaw = result['session'];
    final userRaw = result['user'];
    if (sessionRaw is! Map<String, dynamic> ||
        userRaw is! Map<String, dynamic>) {
      return null;
    }

    final session = Session(
      id: (sessionRaw['id'] ?? '').toString(),
      expiresAt: _parseDateTime(sessionRaw['expiresAt']),
      token: (sessionRaw['token'] ?? '').toString(),
      createdAt: _parseDateTime(sessionRaw['createdAt']),
      updatedAt: _parseDateTime(sessionRaw['updatedAt']),
      ipAddress: (sessionRaw['ipAddress'] ?? '').toString(),
      userAgent: (sessionRaw['userAgent'] ?? '').toString(),
      userId: (sessionRaw['userId'] ?? '').toString(),
    );
    final user = User(
      id: (userRaw['id'] ?? '').toString(),
      email: (userRaw['email'] ?? '').toString(),
      name: (userRaw['name'] ?? '').toString(),
      image: userRaw['image']?.toString(),
      emailVerified: userRaw['emailVerified'] == true,
      createdAt: _parseDateTime(userRaw['createdAt']),
      updatedAt: _parseDateTime(userRaw['updatedAt']),
    );
    if (session.id.isEmpty ||
        session.token.isEmpty ||
        session.userId.isEmpty ||
        user.id.isEmpty ||
        user.email.isEmpty) {
      return null;
    }
    return (session, user);
  } catch (_) {
    return null;
  }
}

/// Serialize concurrent session refreshes (401 storms, parallel widgets).
Future<void>? _refreshInFlight;

/// Reloads [BetterAuth.instance.client] from the SDK, then from raw `/get-session` if needed.
Future<void> refreshBetterAuthClientSession() {
  _refreshInFlight ??= _runRefresh().whenComplete(() => _refreshInFlight = null);
  return _refreshInFlight!;
}

bool _clientHasUsableBearer() {
  final s = BetterAuth.instance.client.session;
  final u = BetterAuth.instance.client.user;
  return s != null &&
      u != null &&
      s.token.isNotEmpty &&
      u.id.isNotEmpty;
}

Future<void> _runRefresh() async {
  final preSession = BetterAuth.instance.client.session;
  final preUser = BetterAuth.instance.client.user;
  final hadPreBearer = preSession != null &&
      preUser != null &&
      preSession.token.isNotEmpty &&
      preUser.id.isNotEmpty;

  final (pair, failure) = await BetterAuth.instance.client.getSession();
  if (failure != null ||
      pair == null ||
      (pair.$1 == null || pair.$2 == null)) {
    final fallback = await _hydrateSessionFromRawGetSession();
    if (fallback != null) {
      final (session, user) = fallback;
      BetterAuth.instance.client.session = session;
      BetterAuth.instance.client.user = user;
      return;
    }
    // Right after sign-in, get-session can fail briefly while cookies/storage settle.
    // Do not wipe a session the SDK just populated.
    if (hadPreBearer) {
      BetterAuth.instance.client.session = preSession;
      BetterAuth.instance.client.user = preUser;
      return;
    }
    BetterAuth.instance.client.session = null;
    BetterAuth.instance.client.user = null;
    return;
  }
  var session = pair.$1!;
  final user = pair.$2!;
  if (session.token.isEmpty && hadPreBearer) {
    session = preSession;
  }
  BetterAuth.instance.client.session = session;
  BetterAuth.instance.client.user = user;
}

/// Aligns SharedPreferences session flags with the hydrated Better Auth client.
///
/// Uses [refreshBetterAuthClientSession] as the **single** source of truth (SDK
/// `getSession` + raw `/get-session` fallback). Previously this duplicated
/// `getSession` and called [LaunchController.signOut] on any miss — right after
/// OAuth/email sign-in that could briefly fail while cookies settled, wiping
/// prefs and triggering "Signed in, but failed to verify active session."
Future<void> applyLaunchPrefsFromBetterAuth(LaunchController launch) async {
  await launch.load();
  if (launch.isGuest) {
    return;
  }

  if (!_clientHasUsableBearer()) {
    await refreshBetterAuthClientSession();
  }

  final hasUsableSession = _clientHasUsableBearer();

  if (hasUsableSession) {
    await launch.setSessionReady(guest: false);
    return;
  }

  BetterAuth.instance.client.session = null;
  BetterAuth.instance.client.user = null;
  await launch.signOut();
}

Future<void> signOutEverywhere(LaunchController launch) async {
  await BetterAuth.instance.client.signOut();
  await launch.signOut();
}

Future<void> signOutAndWipeEverything(LaunchController launch) async {
  try {
    await AuthBackendApi.logoutAll();
  } catch (_) {
    // Best effort: still continue local wipe even if remote revoke fails.
  }
  await BetterAuth.instance.client.signOut();
  BetterAuth.instance.client.session = null;
  BetterAuth.instance.client.user = null;
  await launch.wipeAllLocalState();
}
