import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/state/launch_providers.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final launch = ref.watch(launchControllerProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          ListTile(
            leading: Icon(
              launch.isGuest ? Icons.person_outline : Icons.person,
            ),
            title: Text(launch.isGuest ? 'Guest mode' : 'Signed in'),
            subtitle: Text(
              launch.isGuest
                  ? 'Browse freely — we’ll ask to sign in when you book or save.'
                  : 'Account settings coming next.',
            ),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.language_outlined),
            title: const Text('Language'),
            subtitle: Text(launch.preferredLanguage.toUpperCase()),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Language settings — coming soon')),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.help_outline),
            title: const Text('Help & support'),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Help center — coming soon')),
              );
            },
          ),
          if (kDebugMode) ...[
            const Divider(),
            ListTile(
              leading: const Icon(Icons.restart_alt),
              title: const Text('Reset entry flow (dev)'),
              subtitle: const Text('Clears onboarding + session; returns to Splash'),
              onTap: () async {
                await ref.read(launchControllerProvider).debugResetEntryFlow();
                if (context.mounted) context.go('/splash');
              },
            ),
          ],
        ],
      ),
    );
  }
}
