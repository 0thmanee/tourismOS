import 'package:better_auth_flutter/better_auth_flutter.dart';

import 'auth_backend_api.dart';
import '../state/launch_controller.dart';

Future<void> refreshBetterAuthClientSession() async {
  final (pair, failure) = await BetterAuth.instance.client.getSession();
  if (failure != null || pair == null) {
    BetterAuth.instance.client.session = null;
    BetterAuth.instance.client.user = null;
    return;
  }
  final (session, user) = pair;
  BetterAuth.instance.client.session = session;
  BetterAuth.instance.client.user = user;
}

/// Maps a persisted Better Auth cookie/session into our local entry-flow flags.
Future<void> syncLaunchSessionFromBetterAuth(LaunchController launch) async {
  final (pair, failure) = await BetterAuth.instance.client.getSession();
  if (failure != null || pair == null || pair.$2 == null) {
    BetterAuth.instance.client.session = null;
    BetterAuth.instance.client.user = null;
    await launch.signOut();
    return;
  }
  final (session, user) = pair;
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
