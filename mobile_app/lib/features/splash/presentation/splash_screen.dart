import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/auth/better_auth_session.dart';
import '../../../core/data/app_mock_data.dart';
import '../../../core/state/launch_providers.dart';
import '../../../core/theme/app_tokens.dart';

// TODO(splash): Restore optional "loading" gate on Continue once prefs + connectivity
// are reliable in QA (e.g. disable button until `LaunchController.load()` completes, or
// show a short minimum splash duration). For now Continue is always tappable and we
// `await launch.load()` inside `_continue()` so routing always reads persisted flags.

/// Purpose: brand + exit via **Continue**. Prefs load in background for offline hint.
///
/// Routing: onboarding → auth → home based on saved flags.
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  bool _offline = false;

  @override
  void initState() {
    super.initState();
    _refreshOfflineBanner();
  }

  /// Best-effort; does not block the Continue button.
  Future<void> _refreshOfflineBanner() async {
    final launch = ref.read(launchControllerProvider);
    await launch.load();
    if (launch.sessionReady && !launch.isGuest) {
      await syncLaunchSessionFromBetterAuth(launch);
    }
    if (!mounted) return;
    final online = await _hasNetwork();
    if (!mounted) return;
    setState(() => _offline = !online);
  }

  Future<void> _continue() async {
    final launch = ref.read(launchControllerProvider);
    if (!launch.isLoaded) {
      await launch.load();
    }
    if (launch.sessionReady && !launch.isGuest) {
      await syncLaunchSessionFromBetterAuth(launch);
    }
    if (!mounted) return;
    // Router redirect decides: first launch -> onboarding, then auth/home.
    context.go('/auth');
  }

  Future<void> _retryNetwork() => _refreshOfflineBanner();

  Future<bool> _hasNetwork() async {
    try {
      final results = await Connectivity().checkConnectivity();
      if (results.isEmpty) return true;
      return !results.every((r) => r == ConnectivityResult.none);
    } catch (_) {
      return true;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SizedBox.expand(
        child: Column(
          children: [
            Expanded(
              flex: 62,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Image.asset(
                    'assets/images/splash/welcome_hero.jpg',
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      color: AppTokens.forestMid,
                    ),
                  ),
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          AppTokens.forestDark.withValues(alpha: 0.08),
                          AppTokens.forestDark.withValues(alpha: 0.35),
                        ],
                      ),
                    ),
                  ),
                  // Seam overlay lives on top of the image, so we fade directly
                  // from photo to panel color (no light strip in between).
                  Align(
                    alignment: Alignment.bottomCenter,
                    child: Container(
                      height: 130,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            AppTokens.forestDark.withValues(alpha: 0),
                            AppTokens.forestDark.withValues(alpha: 0.95),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              flex: 38,
              child: Container(
                color: AppTokens.forestDark,
                child: SafeArea(
                  top: false,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 10),
                      Center(
                        child: Icon(
                          Icons.explore_rounded,
                          size: 42,
                          color: AppTokens.brandAccent,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: Text(
                          AppMockData.appBrandName,
                          textAlign: TextAlign.center,
                          style: theme.textTheme.headlineSmall?.copyWith(
                            fontSize: 40,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.35,
                            color: AppTokens.textInverse,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: Text(
                          AppMockData.appTagline,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                            color: AppTokens.textInverse.withValues(alpha: 0.88),
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      if (_offline) ...[
                        const SizedBox(height: 8),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24),
                          child: Text(
                            'No internet connection. You can still continue.',
                            textAlign: TextAlign.center,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: AppTokens.goldLight,
                            ),
                          ),
                        ),
                        Center(
                          child: TextButton(
                            onPressed: _retryNetwork,
                            style: TextButton.styleFrom(
                              foregroundColor: AppTokens.brandAccent,
                            ),
                            child: const Text('Check connection again'),
                          ),
                        ),
                      ] else ...[
                        const Spacer(),
                      ],
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: FilledButton(
                          onPressed: _continue,
                          style: FilledButton.styleFrom(
                            backgroundColor: AppTokens.brandAccent,
                            foregroundColor: AppTokens.forestDark,
                          textStyle: theme.textTheme.labelLarge?.copyWith(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                          ),
                          ),
                          child: const Text('Continue'),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(24, 8, 24, 18),
                        child: Text(
                          'First visit: short intro. Returning: sign in or home.',
                          textAlign: TextAlign.center,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: AppTokens.textInverse.withValues(alpha: 0.72),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
