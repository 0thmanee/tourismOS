import 'package:better_auth_flutter/better_auth_flutter.dart';

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
  if (failure != null) {
    await launch.signOut();
    return;
  }
  if (pair == null) {
    await launch.signOut();
    return;
  }
  final (session, user) = pair;
  BetterAuth.instance.client.session = session;
  BetterAuth.instance.client.user = user;
  if (user == null) {
    await launch.signOut();
    return;
  }
  await launch.setSessionReady(guest: false);
}

Future<void> signOutEverywhere(LaunchController launch) async {
  await BetterAuth.instance.client.signOut();
  await launch.signOut();
}
