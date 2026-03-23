import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/state/launch_providers.dart';
import '../../../core/theme/app_tokens.dart';

/// Auth entry: social + email + guest. Guest must stay visible (conversion).
///
/// States: loading, guest active, errors (social stub).
class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key});

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> {
  bool _loading = false;

  Future<void> _guest() async {
    setState(() => _loading = true);
    await ref.read(launchControllerProvider).setSessionReady(guest: true);
    if (!mounted) return;
    setState(() => _loading = false);
    context.go('/app/home');
  }

  Future<void> _comingSoon(String name) async {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$name — coming soon')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [AppTokens.forestMid, AppTokens.forestDark],
          ),
        ),
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            children: [
              const SizedBox(height: 24),
              Icon(Icons.explore_rounded, size: 56, color: AppTokens.brandAccent),
              const SizedBox(height: 16),
              Text(
                'Welcome to Morocco Experiences',
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: AppTokens.textInverse,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Browse first — sign in when you’re ready to book or save trips.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: AppTokens.textInverse.withValues(alpha: 0.78),
                ),
              ),
              const SizedBox(height: 36),
              Card(
                color: Colors.white.withValues(alpha: 0.05),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppTokens.radiusLg),
                  side: BorderSide(
                    color: Colors.white.withValues(alpha: 0.12),
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      FilledButton.icon(
                        onPressed: _loading ? null : () => _comingSoon('Google'),
                        icon: const Icon(Icons.g_mobiledata_rounded, size: 28),
                        label: const Text('Continue with Google'),
                        style: FilledButton.styleFrom(
                          backgroundColor: AppTokens.brandAccent,
                          foregroundColor: AppTokens.forestDark,
                        ),
                      ),
                      const SizedBox(height: 12),
                      FilledButton.tonalIcon(
                        onPressed: _loading ? null : () => _comingSoon('Apple'),
                        icon: const Icon(Icons.apple, size: 22),
                        label: const Text('Continue with Apple'),
                        style: FilledButton.styleFrom(
                          backgroundColor: Colors.white.withValues(alpha: 0.11),
                          foregroundColor: AppTokens.textInverse,
                        ),
                      ),
                      const SizedBox(height: 12),
                      OutlinedButton(
                        onPressed: _loading ? null : () => context.push('/auth/email'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppTokens.textInverse,
                          side: BorderSide(
                            color: Colors.white.withValues(alpha: 0.3),
                          ),
                        ),
                        child: const Text('Continue with Email'),
                      ),
                      const SizedBox(height: 12),
                      TextButton(
                        onPressed: _loading ? null : _guest,
                        style: TextButton.styleFrom(
                          foregroundColor: AppTokens.brandAccent,
                        ),
                        child: const Text('Continue as Guest'),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'By continuing, you agree to our Terms & Privacy Policy.',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: AppTokens.textInverse.withValues(alpha: 0.72),
                ),
              ),
              if (_loading) ...[
                const SizedBox(height: 24),
                const Center(child: CircularProgressIndicator()),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
