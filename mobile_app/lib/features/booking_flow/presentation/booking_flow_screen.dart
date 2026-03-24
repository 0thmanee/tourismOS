import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/config/app_env.dart';
import '../../experience_detail/data/experience_detail_mock.dart';
import '../../experiences/data/experience_mock_mapper.dart';
import '../../experiences/state/catalog_providers.dart';
import 'booking_flow_loaded.dart';

class BookingFlowScreen extends ConsumerWidget {
  const BookingFlowScreen({super.key, required this.experienceId});

  final String experienceId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Same [Experience] source as [ExperienceDetailScreen] whenever catalog is remote;
    // only `USE_REMOTE_BOOKING` controls POST /v1/bookings.
    if (AppEnv.useRemoteCatalog || AppEnv.useRemoteBooking) {
      final async = ref.watch(experienceDetailProvider(experienceId));
      return async.when(
        loading: () => Scaffold(
          appBar: AppBar(title: const Text('Book')),
          body: const Center(child: CircularProgressIndicator()),
        ),
        error: (_, __) => Scaffold(
          appBar: AppBar(
            title: const Text('Booking'),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded),
              tooltip: 'Back',
              onPressed: () =>
                  context.go('/app/home/experience/$experienceId'),
            ),
          ),
          body: Center(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Could not load this experience.'),
                  const SizedBox(height: 12),
                  FilledButton(
                    onPressed: () =>
                        context.go('/app/home/experience/$experienceId'),
                    child: const Text('Back to experience'),
                  ),
                  const SizedBox(height: 8),
                  TextButton(
                    onPressed: () => context.go('/app/explore'),
                    child: const Text('Browse Explore'),
                  ),
                ],
              ),
            ),
          ),
        ),
        data: (exp) => BookingFlowLoaded(experience: exp),
      );
    }
    final mock = ExperienceDetailMock.get(experienceId);
    final exp = experienceFromDetailMock(mock);
    return BookingFlowLoaded(experience: exp);
  }
}
