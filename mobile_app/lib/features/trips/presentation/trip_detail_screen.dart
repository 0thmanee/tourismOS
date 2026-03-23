import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../state/trips_store.dart';

class TripDetailScreen extends ConsumerWidget {
  const TripDetailScreen({super.key, required this.bookingId});

  final String bookingId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trips = ref.watch(tripsStoreProvider);
    final trip = trips.cast<Map<String, dynamic>>().firstWhere(
          (t) => (t['bookingId'] as String?) == bookingId,
          orElse: () => trips.first,
        );

    final status = trip['status'] as String? ?? 'Confirmed';
    final paymentStatus = trip['paymentStatus'] as String? ?? 'Unknown';
    final startAt = DateTime.tryParse(trip['startAt'] as String? ?? '');
    final dateLabel = startAt != null
        ? '${startAt.day}/${startAt.month}/${startAt.year}'
        : (trip['dateLabel'] as String? ?? 'Date TBD');
    final timeLabel = trip['timeLabel'] as String? ?? 'Time TBD';

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.asset(
                    trip['heroImage'] as String? ?? '',
                    fit: BoxFit.cover,
                    alignment: Alignment.topCenter,
                    errorBuilder: (_, __, ___) => Container(
                      color: Theme.of(context).colorScheme.surfaceContainerHighest,
                    ),
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
                      _Pill(text: '${trip['travelers']} traveler(s)', icon: Icons.group_rounded),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _InfoCard(
                    title: 'Booking summary',
                    rows: [
                      ['Booking ID', '${trip['bookingId']}'],
                      ['Date', dateLabel],
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
                      ['Type', '${trip['bookingType']}'],
                      ['Status', status],
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'What\'s next',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w900,
                        ),
                  ),
                  const SizedBox(height: 8),
                  const _TimelineStep(
                    icon: Icons.mark_email_read_rounded,
                    title: 'Confirmation received',
                    subtitle: 'Your reservation details are ready.',
                    done: true,
                  ),
                  const _TimelineStep(
                    icon: Icons.pin_drop_rounded,
                    title: 'Meeting point reminder',
                    subtitle: 'You\'ll get a reminder before departure.',
                    done: true,
                  ),
                  _TimelineStep(
                    icon: Icons.event_available_rounded,
                    title: 'Day of activity',
                    subtitle: 'Arrive 10 minutes early with your booking ID.',
                    done: status != 'Pending',
                  ),
                  const SizedBox(height: 12),
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
                    onTap: () => _showDoc(context, 'Voucher', trip),
                  ),
                  const SizedBox(height: 8),
                  _DocTile(
                    title: 'Receipt',
                    subtitle: 'Payment and booking status summary',
                    onTap: () => _showDoc(context, 'Receipt', trip),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showDoc(BuildContext context, String docType, Map<String, dynamic> trip) {
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
          Text(text),
        ],
      ),
    );
  }
}

class _TimelineStep extends StatelessWidget {
  const _TimelineStep({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.done,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final bool done;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: done
                  ? Theme.of(context).colorScheme.primary.withValues(alpha: 0.2)
                  : Theme.of(context).colorScheme.surfaceContainerHighest,
            ),
            alignment: Alignment.center,
            child: Icon(icon, size: 18),
          ),
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
