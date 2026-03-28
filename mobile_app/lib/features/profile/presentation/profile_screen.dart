import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/auth/better_auth_user_api.dart';
import '../../../core/state/launch_controller.dart';
import '../../../core/state/launch_providers.dart';
import '../../../core/widgets/app_main_app_bar.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _refreshing = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _refreshUser());
  }

  Future<void> _refreshUser() async {
    final launch = ref.read(launchControllerProvider);
    if (!launch.sessionReady || launch.isGuest) return;
    setState(() => _refreshing = true);
    try {
      await ref.read(authOrchestratorProvider).syncSession(launch);
    } finally {
      if (mounted) {
        setState(() => _refreshing = false);
      }
    }
  }

  Future<void> _signOut() async {
    final launch = ref.read(launchControllerProvider);
    await ref.read(authOrchestratorProvider).signOutAll(launch);
    if (mounted) context.go('/splash');
  }

  Future<void> _showEditProfileDialog() async {
    final user = BetterAuth.instance.client.user;
    if (user == null) return;

    final nameCtrl = TextEditingController(text: user.name);
    final imageCtrl = TextEditingController(text: user.image ?? '');
    final formKey = GlobalKey<FormState>();

    final submitted = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Edit profile'),
        content: Form(
          key: formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Name',
                    border: OutlineInputBorder(),
                  ),
                  textCapitalization: TextCapitalization.words,
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) {
                      return 'Enter your name';
                    }
                    if (v.trim().length > 120) {
                      return 'Too long';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: imageCtrl,
                  keyboardType: TextInputType.url,
                  decoration: const InputDecoration(
                    labelText: 'Photo URL (optional)',
                    hintText: 'https://…',
                    border: OutlineInputBorder(),
                  ),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              if (formKey.currentState?.validate() ?? false) {
                Navigator.pop(ctx, true);
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );

    if (submitted != true || !mounted) {
      nameCtrl.dispose();
      imageCtrl.dispose();
      return;
    }

    final name = nameCtrl.text.trim();
    final imageRaw = imageCtrl.text.trim();
    final image = imageRaw.isEmpty ? null : imageRaw;
    nameCtrl.dispose();
    imageCtrl.dispose();

    try {
      await ref.read(betterAuthUserApiProvider).updateUser(
            name: name,
            image: image,
          );
      await ref
          .read(authOrchestratorProvider)
          .syncSession(ref.read(launchControllerProvider));
      if (mounted) {
        setState(() {});
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(messageFromDio(e))),
        );
      }
    }
  }

  Future<void> _showChangePasswordDialog() async {
    final current = TextEditingController();
    final next = TextEditingController();
    final confirm = TextEditingController();
    final formKey = GlobalKey<FormState>();

    final submitted = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Change password'),
        content: Form(
          key: formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: current,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Current password',
                    border: OutlineInputBorder(),
                  ),
                  validator: (v) =>
                      v == null || v.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: next,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'New password',
                    border: OutlineInputBorder(),
                  ),
                  validator: (v) {
                    if (v == null || v.length < 8) {
                      return 'At least 8 characters';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: confirm,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Confirm new password',
                    border: OutlineInputBorder(),
                  ),
                  validator: (v) {
                    if (v != next.text) {
                      return 'Does not match';
                    }
                    return null;
                  },
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              if (formKey.currentState?.validate() ?? false) {
                Navigator.pop(ctx, true);
              }
            },
            child: const Text('Update'),
          ),
        ],
      ),
    );

    if (submitted != true || !mounted) {
      current.dispose();
      next.dispose();
      confirm.dispose();
      return;
    }

    final cur = current.text;
    final nw = next.text;
    current.dispose();
    next.dispose();
    confirm.dispose();

    try {
      await ref.read(betterAuthUserApiProvider).changePassword(
            currentPassword: cur,
            newPassword: nw,
          );
      await ref
          .read(authOrchestratorProvider)
          .syncSession(ref.read(launchControllerProvider));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Password updated')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(messageFromDio(e))),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final launch = ref.watch(launchControllerProvider);
    final user = BetterAuth.instance.client.user;
    final signedIn = launch.sessionReady && !launch.isGuest && user != null;

    return Scaffold(
      appBar: AppMainAppBar(
        title: const Text('Profile'),
        showBack: false,
        actions: [
          if (signedIn)
            IconButton(
              tooltip: 'Refresh',
              onPressed: _refreshing ? null : _refreshUser,
              icon: _refreshing
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.refresh_rounded),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refreshUser,
        child: ListView(
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
            _AccountCard(
              launch: launch,
              user: user,
              signedIn: signedIn,
              onEdit: signedIn ? _showEditProfileDialog : null,
            ),
            if (signedIn) ...[
              const SizedBox(height: 14),
              _ProfileEntry(
                icon: Icons.lock_outline_rounded,
                title: 'Change password',
                subtitle: 'Update your sign-in password',
                onTap: _showChangePasswordDialog,
              ),
            ],
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
            _ProfileEntry(
              icon: Icons.logout_rounded,
              title: launch.isGuest ? 'Exit guest mode' : 'Sign out',
              subtitle: launch.isGuest
                  ? 'Return to auth and sign in anytime'
                  : 'Sign out from this device',
              onTap: _signOut,
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
      ),
    );
  }
}

class _AccountCard extends StatelessWidget {
  const _AccountCard({
    required this.launch,
    required this.user,
    required this.signedIn,
    this.onEdit,
  });

  final LaunchController launch;
  final User? user;
  final bool signedIn;
  final VoidCallback? onEdit;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (!signedIn || user == null) {
      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: theme.colorScheme.surface,
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
              radius: 28,
              child: Icon(
                launch.isGuest ? Icons.person_outline : Icons.person,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    launch.isGuest ? 'Guest mode' : 'Signed in',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    launch.isGuest
                        ? 'Browse freely. Sign in to save your profile and sync across devices.'
                        : 'Loading account…',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    final u = user!;
    final img = u.image;
    final hasPhoto = img != null && img.isNotEmpty;

    Widget avatar() {
      if (hasPhoto) {
        return ClipOval(
          child: Image.network(
            img,
            width: 64,
            height: 64,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => CircleAvatar(
              radius: 32,
              child: Text(
                _initials(u.name),
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
        );
      }
      return CircleAvatar(
        radius: 32,
        child: Text(
          _initials(u.name),
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w800,
          ),
        ),
      );
    }

    return Material(
      color: theme.colorScheme.surface,
      borderRadius: BorderRadius.circular(16),
      elevation: 0,
      shadowColor: Colors.transparent,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: theme.colorScheme.surface,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  avatar(),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          u.name,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          u.email,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(
                              u.emailVerified
                                  ? Icons.verified_rounded
                                  : Icons.mark_email_unread_outlined,
                              size: 18,
                              color: u.emailVerified
                                  ? theme.colorScheme.primary
                                  : theme.colorScheme.outline,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              u.emailVerified
                                  ? 'Email verified'
                                  : 'Email not verified',
                              style: theme.textTheme.labelMedium?.copyWith(
                                color: theme.colorScheme.onSurfaceVariant,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  if (onEdit != null)
                    IconButton(
                      tooltip: 'Edit',
                      onPressed: onEdit,
                      icon: const Icon(Icons.edit_outlined),
                    ),
                ],
              ),
              if (onEdit != null) ...[
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: onEdit,
                    icon: const Icon(Icons.edit_rounded, size: 18),
                    label: const Text('Edit profile'),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String _initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty) return '?';
    if (parts.length == 1) {
      return parts.first.isNotEmpty ? parts.first[0].toUpperCase() : '?';
    }
    final a = parts[0].isNotEmpty ? parts[0][0] : '';
    final b = parts[1].isNotEmpty ? parts[1][0] : '';
    return ('$a$b').toUpperCase();
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
                              color: Theme.of(context)
                                  .colorScheme
                                  .onSurfaceVariant,
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
