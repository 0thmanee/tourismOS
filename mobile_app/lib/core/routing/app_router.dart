import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/auth_screen.dart';
import '../../features/auth/presentation/email_auth_screen.dart';
import '../../features/auth/presentation/email_signup_screen.dart';
import '../../features/booking_flow/presentation/booking_flow_screen.dart';
import '../../features/experience_detail/presentation/experience_detail_screen.dart';
import '../../features/provider_profile/presentation/provider_profile_screen.dart';
import '../../features/explore/presentation/explore_screen.dart';
import '../../features/favorites/presentation/favorites_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/onboarding/presentation/onboarding_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/profile/presentation/settings_screen.dart';
import '../../features/profile/presentation/support_screen.dart';
import '../../features/splash/presentation/splash_screen.dart';
import '../../features/trips/presentation/trips_screen.dart';
import '../../features/trips/presentation/trip_detail_screen.dart';
import '../auth/auth_session_controller.dart';
import '../state/launch_controller.dart';

/// Single [GoRouter] instance for the whole app — create once (e.g. in [main.dart]).
///
/// Do not put this inside a Riverpod [Provider] that rebuilds when [LaunchController]
/// notifies, or navigation resets to [initialLocation].
class _RouterRefresh extends ChangeNotifier {
  _RouterRefresh(this.launch, this.auth) {
    launch.addListener(_notify);
    auth.addListener(_notify);
  }

  final LaunchController launch;
  final AuthSessionController auth;

  void _notify() => notifyListeners();
}

GoRouter createAppRouter(LaunchController launch, AuthSessionController auth) {
  Uri? pendingAfterBootstrap;
  return GoRouter(
    initialLocation: '/splash',
    debugLogDiagnostics: kDebugMode,
    refreshListenable: _RouterRefresh(launch, auth),
    redirect: (context, state) {
      final path = state.uri.path;

      if (!auth.hasCheckedSession || auth.isBootstrapping) {
        if (path != '/splash') {
          pendingAfterBootstrap ??= state.uri;
          return '/splash';
        }
        return null;
      }

      final canEnterApp = auth.authStatus == AuthStatus.authenticated ||
          auth.authStatus == AuthStatus.guest;

      // After bootstrap resolves, restore the initially requested location once,
      // as long as the resolved auth/onboarding state allows it.
      if (pendingAfterBootstrap != null) {
        final requested = pendingAfterBootstrap!;
        pendingAfterBootstrap = null;
        final requestedPath = requested.path;

        final requiresOnboarding = requestedPath.startsWith('/app') ||
            requestedPath.startsWith('/auth') ||
            requestedPath == '/onboarding';

        if (requiresOnboarding && !launch.onboardingCompleted) {
          return '/onboarding';
        }
        if (requestedPath.startsWith('/app') && !canEnterApp) {
          return '/auth';
        }
        if (requestedPath.startsWith('/auth') && canEnterApp) {
          return '/app/home';
        }
        return requested.toString();
      }

      if (!launch.onboardingCompleted) {
        if (path != '/onboarding') return '/onboarding';
        return null;
      }

      if (path.startsWith('/app')) {
        return canEnterApp ? null : '/auth';
      }
      if (path.startsWith('/auth')) {
        return canEnterApp ? '/app/home' : null;
      }
      if (path == '/splash' || path == '/onboarding') {
        return canEnterApp ? '/app/home' : '/auth';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/auth',
        builder: (context, state) => const AuthScreen(),
      ),
      GoRoute(
        path: '/auth/email',
        builder: (context, state) => const EmailAuthScreen(),
      ),
      GoRoute(
        path: '/auth/signup',
        builder: (context, state) => const EmailSignupScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return AppTabShell(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/app/home',
                name: 'home',
                builder: (context, state) => const HomeScreen(),
                routes: [
                  GoRoute(
                    path: 'experience/:id',
                    name: 'experience-detail',
                    builder: (context, state) => ExperienceDetailScreen(
                      experienceId: state.pathParameters['id'] ?? 'agafay-quad',
                    ),
                    routes: [
                      GoRoute(
                        path: 'book',
                        name: 'booking-flow',
                        builder: (context, state) => BookingFlowScreen(
                          experienceId: state.pathParameters['id'] ?? 'agafay-quad',
                        ),
                      ),
                    ],
                  ),
                  GoRoute(
                    path: 'provider/:organizationId',
                    name: 'provider-profile',
                    builder: (context, state) => ProviderProfileScreen(
                      organizationId:
                          state.pathParameters['organizationId'] ?? '',
                    ),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/app/explore',
                name: 'explore',
                builder: (context, state) => const ExploreScreen(),
                routes: [
                  GoRoute(
                    path: 'favorites',
                    name: 'favorites',
                    builder: (context, state) => const FavoritesScreen(),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/app/trips',
                name: 'trips',
                builder: (context, state) => const TripsScreen(),
                routes: [
                  GoRoute(
                    path: 'detail/:bookingId',
                    name: 'trip-detail',
                    builder: (context, state) => TripDetailScreen(
                      bookingId: state.pathParameters['bookingId'] ?? '',
                    ),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/app/profile',
                name: 'profile',
                builder: (context, state) => const ProfileScreen(),
                routes: [
                  GoRoute(
                    path: 'settings',
                    name: 'profile-settings',
                    builder: (context, state) => const SettingsScreen(),
                  ),
                  GoRoute(
                    path: 'support',
                    name: 'profile-support',
                    builder: (context, state) => const SupportScreen(),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

class AppTabShell extends StatelessWidget {
  const AppTabShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) {
          navigationShell.goBranch(
            index,
            initialLocation: index == navigationShell.currentIndex,
          );
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.explore_outlined),
            selectedIcon: Icon(Icons.explore),
            label: 'Explore',
          ),
          NavigationDestination(
            icon: Icon(Icons.event_note_outlined),
            selectedIcon: Icon(Icons.event_note),
            label: 'Trips',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
