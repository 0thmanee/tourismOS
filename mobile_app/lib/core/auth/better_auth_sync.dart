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

Future<void> _runRefresh() async {
  final (pair, failure) = await BetterAuth.instance.client.getSession();
  if (failure != null || pair == null) {
    final fallback = await _hydrateSessionFromRawGetSession();
    if (fallback != null) {
      final (session, user) = fallback;
      BetterAuth.instance.client.session = session;
      BetterAuth.instance.client.user = user;
      return;
    }
    BetterAuth.instance.client.session = null;
    BetterAuth.instance.client.user = null;
    return;
  }
  final (session, user) = pair;
  BetterAuth.instance.client.session = session;
  BetterAuth.instance.client.user = user;
}

/// Aligns SharedPreferences session flags with the current Better Auth client state.
Future<void> applyLaunchPrefsFromBetterAuth(LaunchController launch) async {
  final (pair, failure) = await BetterAuth.instance.client.getSession();
  var resolvedPair = pair;
  if (failure != null || pair == null || pair.$2 == null) {
    final fallback = await _hydrateSessionFromRawGetSession();
    if (fallback != null) {
      resolvedPair = fallback;
    }
  }

  if (resolvedPair == null || resolvedPair.$2 == null) {
    BetterAuth.instance.client.session = null;
    BetterAuth.instance.client.user = null;
    await launch.signOut();
    return;
  }
  final (session, user) = resolvedPair;
  BetterAuth.instance.client.session = session;
  BetterAuth.instance.client.user = user;

  await launch.setSessionReady(guest: false);
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
