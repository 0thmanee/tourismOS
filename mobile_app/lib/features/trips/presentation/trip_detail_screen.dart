import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/config/app_env.dart';
import '../../../core/widgets/app_main_app_bar.dart';
import '../../../core/widgets/catalog_image.dart';
import '../state/trip_remote_providers.dart';
import '../state/trips_store.dart';

bool _tripHasNote(String? s) => s != null && s.trim().isNotEmpty;

class TripDetailScreen extends ConsumerWidget {
  const TripDetailScreen({super.key, required this.bookingId});

  final String bookingId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (AppEnv.useRemoteTrips) {
      final asyncTrip = ref.watch(tripRemoteDetailProvider(bookingId));
      final stored = ref.watch(tripsStoreProvider);
      Map<String, dynamic>? localTrip;
      for (final t in stored) {
        if ((t['bookingId'] as String?) == bookingId) {
          localTrip = t;
          break;
        }
      }
      return asyncTrip.when(
        loading: () => Scaffold(
          appBar: AppMainAppBar(
            title: const Text('Trip'),
            showBack: true,
            onBackFallback: () => context.go('/app/trips'),
          ),
          body: const Center(child: CircularProgressIndicator()),
        ),
        error: (_, __) {
          if (localTrip != null) {
            return _TripDetailLoadedView(trip: localTrip);
          }
          return _TripDetailStateScaffold(
            title: 'This booking is unavailable',
            message:
                'The booking reference is invalid or no longer available.',
            primaryLabel: 'Back to Trips',
            onPrimary: () => context.go('/app/trips'),
          );
        },
        data: (trip) => _TripDetailLoadedView(trip: trip),
      );
    }

    final stored = ref.watch(tripsStoreProvider);
    final trips = stored.isEmpty ? TripsStore.seedTrips : stored;
    final matched = trips.cast<Map<String, dynamic>>().where(
      (t) => (t['bookingId'] as String?) == bookingId,
    );
    if (matched.isEmpty) {
      return _TripDetailStateScaffold(
        title: 'This booking is unavailable',
        message: 'The booking reference is invalid or no longer available.',
        primaryLabel: 'Back to Trips',
        onPrimary: () => context.go('/app/trips'),
      );
    }
    return _TripDetailLoadedView(trip: matched.first);
  }
}

class _TripDetailLoadedView extends StatelessWidget {
  const _TripDetailLoadedView({required this.trip});

  final Map<String, dynamic> trip;

  @override
  Widget build(BuildContext context) {
    final status = trip['status'] as String? ?? 'Confirmed';
    final paymentStatus = trip['paymentStatus'] as String? ?? 'Unknown';
    final startAt = DateTime.tryParse(trip['startAt'] as String? ?? '');
    final dateLabel = startAt != null
        ? '${startAt.day}/${startAt.month}/${startAt.year}'
        : (trip['dateLabel'] as String? ?? 'Date TBD');
    final friendlyDate = _tripFriendlyDateLabel(startAt);
    final timeLabel = trip['timeLabel'] as String? ?? 'Time TBD';
    final isPending = status.toLowerCase() == 'pending';
    final isDepositPaid = paymentStatus.toLowerCase().contains('deposit');
    final isMultiDay = (trip['bookingType'] as String? ?? '').contains('MULTI_DAY');
    final nextTitle = isPending
        ? 'Waiting for operator confirmation'
        : isDepositPaid
            ? 'Your spot is secured'
            : 'You are ready for your trip';
    final nextSubtitle = isPending
        ? 'We notify you as soon as the operator confirms availability and final timing.'
        : isDepositPaid
            ? 'Pay the remaining amount on arrival and keep your booking reference ready.'
            : 'Arrive 15 minutes early and present your voucher at the meeting point.';
    final logisticsHint = isPending
        ? 'Exact pickup instructions are shared once the operator confirms your request.'
        : 'Exact directions and final reminder are available in your voucher.';
    final dayOneHint = isMultiDay
        ? 'This is a multi-day package. Review day-1 meeting details carefully.'
        : 'This is a single-day experience.';

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            foregroundColor: Colors.white,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded),
              tooltip: 'Back',
              onPressed: () {
                if (context.canPop()) {
                  context.pop();
                } else {
                  context.go('/app/trips');
                }
              },
            ),
            actions: [
              const AppProfileAvatarButton(),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  CatalogImage(
                    ref: trip['heroImage'] as String?,
                    fit: BoxFit.cover,
                    alignment: Alignment.topCenter,
                    errorColor: Theme.of(context).colorScheme.surfaceContainerHighest,
                  ),
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withValues(alpha: 0.03),
                          Colors.black.withValues(alpha: 0.58),
                        ],
                      ),
                    ),
                  ),
                  Positioned(
                    left: 16,
                    right: 16,
                    bottom: 14,
                    child: Text(
                      trip['title'] as String? ?? 'Trip',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _Pill(text: status, icon: Icons.verified_rounded),
                      _Pill(text: paymentStatus, icon: Icons.payments_rounded),
                      _Pill(
                        text: '${trip['travelers']} traveler(s)',
                        icon: Icons.group_rounded,
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _WhatNextCard(
                    title: nextTitle,
                    subtitle: nextSubtitle,
                    status: status,
                    paymentStatus: paymentStatus,
                    isPending: isPending,
                  ),
                  const SizedBox(height: 12),
                  _InfoCard(
                    title: 'Booking summary',
                    rows: [
                      ['Booking ID', '${trip['bookingId']}'],
                      ['Date', '$friendlyDate ($dateLabel)'],
                      ['Time', timeLabel],
                      ['City', '${trip['city']}'],
                      ['Operator', '${trip['operatorName']}'],
                    ],
                  ),
                  const SizedBox(height: 10),
                  _InfoCard(
                    title: 'Meeting and logistics',
                    rows: [
                      ['Meeting point', '${trip['meetingPoint']}'],
                      if (_tripHasNote(trip['meetingNote'] as String?))
                        ['Operator note', '${trip['meetingNote']}'],
                      ['Arrival', 'Be there 15 minutes before start'],
                      ['Type', '${trip['bookingType']} • $dayOneHint'],
                      ['Details', logisticsHint],
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'Documents',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w900,
                        ),
                  ),
                  const SizedBox(height: 8),
                  _DocTile(
                    title: 'Voucher',
                    subtitle: 'Booking QR and check-in instructions',
                    onTap: () => _showTripDoc(context, 'Voucher', trip),
                  ),
                  const SizedBox(height: 8),
                  _DocTile(
                    title: 'Receipt',
                    subtitle: 'Payment and booking status summary',
                    onTap: () => _showTripDoc(context, 'Receipt', trip),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      color: Theme.of(context).colorScheme.surfaceContainerHigh,
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.support_agent_rounded),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Need help? Contact support with booking ID ${trip['bookingId']}.',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

String _tripFriendlyDateLabel(DateTime? startAt) {
  if (startAt == null) return 'Date soon';
  final now = DateTime.now();
  final today = DateTime(now.year, now.month, now.day);
  final target = DateTime(startAt.year, startAt.month, startAt.day);
  final diffDays = target.difference(today).inDays;
  if (diffDays == 0) return 'Today';
  if (diffDays == 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays <= 6) return 'In $diffDays days';
  if (diffDays >= 0 && target.weekday >= DateTime.friday) return 'This weekend';
  return '${startAt.day}/${startAt.month}/${startAt.year}';
}

void _showTripDoc(
  BuildContext context,
  String docType,
  Map<String, dynamic> trip,
) {
  showDialog<void>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(docType),
      content: Text(
        '$docType for ${trip['title']}\n'
        'Booking ID: ${trip['bookingId']}\n'
        'Status: ${trip['status']}\n'
        'Payment: ${trip['paymentStatus']}',
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Close'),
        ),
      ],
    ),
  );
}

class _TripDetailStateScaffold extends StatelessWidget {
  const _TripDetailStateScaffold({
    required this.title,
    required this.message,
    required this.primaryLabel,
    required this.onPrimary,
  });

  final String title;
  final String message;
  final String primaryLabel;
  final VoidCallback onPrimary;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppMainAppBar(
        title: const Text('Trip detail'),
        showBack: true,
        onBackPressed: onPrimary,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              color: Theme.of(context).colorScheme.surfaceContainerHighest,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                ),
                const SizedBox(height: 6),
                Text(
                  message,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                ),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: onPrimary,
                  child: Text(primaryLabel),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.title, required this.rows});

  final String title;
  final List<List<String>> rows;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        color: Theme.of(context).colorScheme.surface,
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
          ),
          const SizedBox(height: 8),
          for (final row in rows)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 110,
                    child: Text(
                      row[0],
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                    ),
                  ),
                  Expanded(
                    child: Text(
                      row[1],
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _WhatNextCard extends StatelessWidget {
  const _WhatNextCard({
    required this.title,
    required this.subtitle,
    required this.status,
    required this.paymentStatus,
    required this.isPending,
  });

  final String title;
  final String subtitle;
  final String status;
  final String paymentStatus;
  final bool isPending;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: Theme.of(context).colorScheme.primaryContainer,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isPending ? Icons.hourglass_top_rounded : Icons.event_available_rounded,
                color: Theme.of(context).colorScheme.onPrimaryContainer,
              ),
              const SizedBox(width: 8),
              Text(
                "What's next",
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w900,
                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w900,
                  color: Theme.of(context).colorScheme.onPrimaryContainer,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onPrimaryContainer,
                ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _InlineMeta(text: status),
              _InlineMeta(text: paymentStatus),
            ],
          ),
        ],
      ),
    );
  }
}

class _InlineMeta extends StatelessWidget {
  const _InlineMeta({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: Colors.black.withValues(alpha: 0.12),
      ),
      child: Text(
        text,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: Theme.of(context).colorScheme.onPrimaryContainer,
            ),
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.text, required this.icon});

  final String text;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16),
          const SizedBox(width: 6),
          Text(
            text,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
          ),
        ],
      ),
    );
  }
}

class _DocTile extends StatelessWidget {
  const _DocTile({
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
        ),
        child: Row(
          children: [
            const Icon(Icons.description_rounded),
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
    );
  }
}
