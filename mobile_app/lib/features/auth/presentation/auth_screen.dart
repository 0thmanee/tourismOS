import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/data/app_mock_data.dart';
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
  _AuthProvider? _loadingProvider;

  bool get _loading => _loadingProvider != null;

  void _startLoading(_AuthProvider provider) {
    if (!mounted) return;
    setState(() => _loadingProvider = provider);
  }

  void _stopLoading() {
    if (!mounted) return;
    setState(() => _loadingProvider = null);
  }

  String _loadingCopy() {
    switch (_loadingProvider) {
      case _AuthProvider.google:
        return 'Connecting to Google';
      case _AuthProvider.apple:
        return 'Connecting to Apple';
      case _AuthProvider.email:
        return 'Opening email sign in';
      case _AuthProvider.guest:
        return 'Starting guest session';
      case null:
        return '';
    }
  }

  void _showGoogleConfigHint([String? details]) {
    if (!mounted) return;
    final suffix = (details != null && details.isNotEmpty) ? '\n$details' : '';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Google Sign-In configuration issue. Check Android package/SHA-1 in Google Cloud, '
          'pass GOOGLE_SERVER_CLIENT_ID at runtime, and ensure backend GOOGLE_CLIENT_ID/SECRET are set.$suffix',
        ),
      ),
    );
  }

  Future<void> _afterAuthSuccess() async {
    if (!mounted) return;
    context.go('/splash');
  }

  Future<void> _google() async {
    _startLoading(_AuthProvider.google);
    try {
      await ref.read(authOrchestratorProvider).signInWithGoogle(
            ref.read(launchControllerProvider),
          );
      await _afterAuthSuccess();
    } on Exception catch (e) {
      if (!mounted) return;
      final msg = e.toString().replaceFirst('Exception: ', '');
      if (msg.startsWith('GOOGLE_CONFIG_ERROR:')) {
        _showGoogleConfigHint(msg);
      } else if (msg.startsWith('GOOGLE_NETWORK_ERROR:')) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Google services are unreachable. Check emulator internet and Play Services, then retry.',
            ),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(msg)),
        );
      }
    } finally {
      _stopLoading();
    }
  }

  Future<void> _apple() async {
    _startLoading(_AuthProvider.apple);
    try {
      await ref.read(authOrchestratorProvider).signInWithApple(
            ref.read(launchControllerProvider),
          );
      await _afterAuthSuccess();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    } finally {
      _stopLoading();
    }
  }

  Future<void> _guest() async {
    _startLoading(_AuthProvider.guest);
    await ref
        .read(authOrchestratorProvider)
        .continueAsGuest(ref.read(launchControllerProvider));
    if (!mounted) return;
    _stopLoading();
    context.go('/splash');
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: Stack(
        children: [
          Container(
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
                    'Welcome to ${AppMockData.appBrandName}',
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
                            onPressed: _loading ? null : _google,
                            icon: const Icon(Icons.g_mobiledata_rounded, size: 28),
                            label: const Text('Continue with Google'),
                            style: FilledButton.styleFrom(
                              backgroundColor: AppTokens.brandAccent,
                              foregroundColor: AppTokens.forestDark,
                            ),
                          ),
                          const SizedBox(height: 12),
                          FilledButton.tonalIcon(
                            onPressed: _loading ? null : _apple,
                            icon: const Icon(Icons.apple, size: 22),
                            label: const Text('Continue with Apple'),
                            style: FilledButton.styleFrom(
                              backgroundColor: Colors.white.withValues(alpha: 0.11),
                              foregroundColor: AppTokens.textInverse,
                            ),
                          ),
                          const SizedBox(height: 12),
                          OutlinedButton(
                            onPressed: _loading
                                ? null
                                : () {
                                    context.push('/auth/email');
                                  },
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
                ],
              ),
            ),
          ),
          if (_loadingProvider != null)
            Positioned.fill(
              child: AbsorbPointer(
                absorbing: true,
                child: ColoredBox(
                  color: Colors.black.withValues(alpha: 0.46),
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const SizedBox(
                          width: 28,
                          height: 28,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.6,
                            color: AppTokens.brandAccent,
                          ),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          _loadingCopy(),
                          textAlign: TextAlign.center,
                          style: theme.textTheme.titleSmall?.copyWith(
                            color: AppTokens.textInverse,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

enum _AuthProvider { google, apple, email, guest }
