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
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
        children: [
          Text(
            'Your account',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w900,
                  fontSize: 34,
                ),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              color: Theme.of(context).colorScheme.surface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.06),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  child: Icon(launch.isGuest ? Icons.person_outline : Icons.person),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        launch.isGuest ? 'Guest mode' : 'Signed in',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w900,
                            ),
                      ),
                      Text(
                        launch.isGuest
                            ? 'Browse freely. Sign in when you are ready to book or sync trips.'
                            : 'Your account is ready for bookings and saved plans.',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          _ProfileEntry(
            icon: Icons.favorite_outline_rounded,
            title: 'Saved experiences',
            subtitle: 'Review your shortlist',
            onTap: () => context.go('/app/explore/favorites'),
          ),
          _ProfileEntry(
            icon: Icons.settings_outlined,
            title: 'Settings',
            subtitle: 'Language, notifications, privacy',
            onTap: () => context.go('/app/profile/settings'),
          ),
          _ProfileEntry(
            icon: Icons.help_outline_rounded,
            title: 'Help & support',
            subtitle: 'Get answers or contact support',
            onTap: () => context.go('/app/profile/support'),
          ),
          _ProfileEntry(
            icon: Icons.info_outline_rounded,
            title: 'About',
            subtitle: 'Version, terms and privacy',
            onTap: () => context.go('/app/profile/settings'),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: Theme.of(context).colorScheme.surfaceContainerHighest,
            ),
            child: Text(
              'Preferred language: ${launch.preferredLanguage.toUpperCase()}',
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
          ),
          if (kDebugMode) ...[
            const SizedBox(height: 12),
            _ProfileEntry(
              icon: Icons.restart_alt_rounded,
              title: 'Reset entry flow (dev)',
              subtitle: 'Clears onboarding + session, then goes to Splash',
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

class _ProfileEntry extends StatelessWidget {
  const _ProfileEntry({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Icon(icon),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                      Text(
                        subtitle,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right_rounded),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
