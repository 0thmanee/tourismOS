import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import '../../../core/auth/better_auth_session.dart';
import '../../../core/config/app_env.dart';
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
  bool _loading = false;

  void _showAuthError(BetterAuthFailure? err) {
    if (!mounted || err == null) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(err.message)),
    );
  }

  Future<void> _afterAuthSuccess() async {
    await syncLaunchSessionFromBetterAuth(ref.read(launchControllerProvider));
    if (!mounted) return;
    context.go('/app/home');
  }

  Future<void> _google() async {
    if (AppEnv.googleServerClientId.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Add GOOGLE_SERVER_CLIENT_ID (web OAuth client) via --dart-define.',
          ),
        ),
      );
      return;
    }
    setState(() => _loading = true);
    try {
      final google = GoogleSignIn(
        serverClientId: AppEnv.googleServerClientId,
      );
      final account = await google.signIn();
      if (account == null) {
        if (!mounted) return;
        setState(() => _loading = false);
        return;
      }
      final auth = await account.authentication;
      final idToken = auth.idToken;
      final accessToken = auth.accessToken;
      if (idToken == null ||
          idToken.isEmpty ||
          accessToken == null ||
          accessToken.isEmpty) {
        if (!mounted) return;
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Google Sign-In did not return tokens.'),
          ),
        );
        return;
      }
      final (_, err) = await BetterAuth.instance.client.signInWithIdToken(
        provider: SocialProvider.google,
        idToken: idToken,
        accessToken: accessToken,
      );
      if (err != null) {
        if (!mounted) return;
        setState(() => _loading = false);
        _showAuthError(err);
        return;
      }
      await _afterAuthSuccess();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _apple() async {
    setState(() => _loading = true);
    try {
      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );
      final idToken = credential.identityToken;
      final code = credential.authorizationCode;
      if (idToken == null ||
          idToken.isEmpty ||
          code.isEmpty) {
        if (!mounted) return;
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Sign in with Apple did not return tokens.'),
          ),
        );
        return;
      }
      final (_, err) = await BetterAuth.instance.client.signInWithIdToken(
        provider: SocialProvider.apple,
        idToken: idToken,
        accessToken: code,
      );
      if (err != null) {
        if (!mounted) return;
        setState(() => _loading = false);
        _showAuthError(err);
        return;
      }
      await _afterAuthSuccess();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _guest() async {
    setState(() => _loading = true);
    await ref.read(launchControllerProvider).setSessionReady(guest: true);
    if (!mounted) return;
    setState(() => _loading = false);
    context.go('/app/home');
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
                        onPressed:
                            _loading ? null : _google,
                        icon: const Icon(Icons.g_mobiledata_rounded, size: 28),
                        label: const Text('Continue with Google'),
                        style: FilledButton.styleFrom(
                          backgroundColor: AppTokens.brandAccent,
                          foregroundColor: AppTokens.forestDark,
                        ),
                      ),
                      const SizedBox(height: 12),
                      FilledButton.tonalIcon(
                        onPressed:
                            _loading ? null : _apple,
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
