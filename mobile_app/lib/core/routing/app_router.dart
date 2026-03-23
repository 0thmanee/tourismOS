import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/auth_screen.dart';
import '../../features/auth/presentation/email_auth_screen.dart';
import '../../features/auth/presentation/email_signup_screen.dart';
import '../../features/booking_flow/presentation/booking_flow_screen.dart';
import '../../features/experience_detail/presentation/experience_detail_screen.dart';
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
import '../state/launch_controller.dart';

/// Single [GoRouter] instance for the whole app — create once (e.g. in [main.dart]).
///
/// Do not put this inside a Riverpod [Provider] that rebuilds when [LaunchController]
/// notifies, or navigation resets to [initialLocation].
GoRouter createAppRouter(LaunchController launch) {
  return GoRouter(
    initialLocation: '/splash',
    debugLogDiagnostics: kDebugMode,
    refreshListenable: launch,
    redirect: (context, state) {
      final path = state.uri.path;
      if (path.startsWith('/app')) {
        if (!launch.onboardingCompleted) return '/onboarding';
        if (!launch.sessionReady) return '/auth';
      }
      if (path.startsWith('/auth')) {
        if (!launch.onboardingCompleted) return '/onboarding';
        if (launch.sessionReady) return '/app/home';
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
