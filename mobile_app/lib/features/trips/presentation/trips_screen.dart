import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../state/trips_store.dart';

enum _TripsFilter { all, upcoming, pending, past }

class TripsScreen extends ConsumerStatefulWidget {
  const TripsScreen({super.key});

  @override
  ConsumerState<TripsScreen> createState() => _TripsScreenState();
}

class _TripsScreenState extends ConsumerState<TripsScreen> {
  _TripsFilter _filter = _TripsFilter.all;

  @override
  Widget build(BuildContext context) {
    final ref = this.ref;
    final storedTrips = ref.watch(tripsStoreProvider);
    final trips = storedTrips.isEmpty ? TripsStore.seedTrips : storedTrips;
    final showingDemo = storedTrips.isEmpty;
    final now = DateTime.now();
    final upcoming = trips.where((t) {
      final date = DateTime.tryParse(t['startAt'] as String? ?? '');
      return date != null && (date.isAfter(now) || date.isAtSameMomentAs(now));
    }).toList();
    final past = trips.where((t) {
      final date = DateTime.tryParse(t['startAt'] as String? ?? '');
      return date != null && date.isBefore(now);
    }).toList();
    final pendingCount = trips.where((t) => (t['status'] as String?) == 'Pending').length;
    final nextTrip = upcoming.isNotEmpty ? upcoming.first : null;
    final pending = trips.where((t) => (t['status'] as String?) == 'Pending').toList();

    return Scaffold(
      appBar: AppBar(title: const Text('My Trips')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
          children: [
            Text(
              'Your travel plans',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                    fontSize: 34,
                  ),
            ),
            const SizedBox(height: 6),
            Text(
              'Track what is next, what is confirmed, and what needs action.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.w600,
                  ),
            ),
            if (showingDemo) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  color: Theme.of(context).colorScheme.surfaceContainerHighest,
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline_rounded, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'No saved trips yet — showing demo itinerary cards.',
                        style: Theme.of(context).textTheme.labelLarge,
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _StatTile(
                    label: 'Upcoming',
                    value: '${upcoming.length}',
                    icon: Icons.flight_takeoff_rounded,
                    selected: _filter == _TripsFilter.upcoming,
                    onTap: () => setState(() => _filter = _TripsFilter.upcoming),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _StatTile(
                    label: 'Pending',
                    value: '$pendingCount',
                    icon: Icons.schedule_send_rounded,
                    selected: _filter == _TripsFilter.pending,
                    onTap: () => setState(() => _filter = _TripsFilter.pending),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _StatTile(
                    label: 'Past',
                    value: '${past.length}',
                    icon: Icons.history_rounded,
                    selected: _filter == _TripsFilter.past,
                    onTap: () => setState(() => _filter = _TripsFilter.past),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            if (nextTrip != null && (_filter == _TripsFilter.all || _filter == _TripsFilter.upcoming)) ...[
              _NextTripHero(item: nextTrip),
              const SizedBox(height: 16),
            ],
            if (_filter == _TripsFilter.all) ...[
              _TripsSection(
                title: 'Upcoming',
                items: upcoming.where((t) => (t['status'] as String?) != 'Pending').toList(),
                emptyLabel: 'No upcoming trips yet.',
              ),
              const SizedBox(height: 16),
              _TripsSection(
                title: 'Pending',
                items: pending,
                emptyLabel: 'No pending confirmations.',
              ),
              const SizedBox(height: 16),
              _TripsSection(
                title: 'Past',
                items: past,
                emptyLabel: 'No past trips yet.',
              ),
            ] else if (_filter == _TripsFilter.upcoming) ...[
              _TripsSection(
                title: 'Upcoming',
                items: upcoming.where((t) => (t['status'] as String?) != 'Pending').toList(),
                emptyLabel: 'No upcoming trips yet.',
              ),
            ] else if (_filter == _TripsFilter.pending) ...[
              _TripsSection(
                title: 'Pending',
                items: pending,
                emptyLabel: 'No pending confirmations.',
              ),
            ] else ...[
              _TripsSection(
                title: 'Past',
                items: past,
                emptyLabel: 'No past trips yet.',
              ),
            ],
            if ((_filter == _TripsFilter.pending && pending.isEmpty) ||
                (_filter == _TripsFilter.upcoming &&
                    upcoming.where((t) => (t['status'] as String?) != 'Pending').isEmpty) ||
                (_filter == _TripsFilter.past && past.isEmpty)) ...[
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerLeft,
                child: FilledButton.tonal(
                  onPressed: () => setState(() => _filter = _TripsFilter.all),
                  child: const Text('Show all trips'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _TripsSection extends StatelessWidget {
  const _TripsSection({
    required this.title,
    required this.items,
    required this.emptyLabel,
  });

  final String title;
  final List<Map<String, dynamic>> items;
  final String emptyLabel;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              title,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(999),
                color: Theme.of(context).colorScheme.surfaceContainerHighest,
              ),
              child: Text(
                '${items.length}',
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        if (items.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              color: Theme.of(context).colorScheme.surfaceContainerHighest,
            ),
            child: Text(emptyLabel),
          ),
        for (final trip in items) ...[
          _TripCard(item: trip),
          const SizedBox(height: 10),
        ],
      ],
    );
  }
}

class _TripCard extends StatelessWidget {
  const _TripCard({required this.item});

  final Map<String, dynamic> item;

  @override
  Widget build(BuildContext context) {
    final status = item['status'] as String? ?? 'Confirmed';
    final paymentStatus = item['paymentStatus'] as String? ?? 'Unknown';
    final date = DateTime.tryParse(item['startAt'] as String? ?? '');
    final dateLabel = date != null
        ? '${date.day}/${date.month}/${date.year}'
        : (item['dateLabel'] as String? ?? 'Date TBD');
    final timeLabel = item['timeLabel'] as String? ?? 'Time TBD';

    final isPending = status == 'Pending';
    final statusColor = isPending
        ? Theme.of(context).colorScheme.tertiary
        : Theme.of(context).colorScheme.primary;

    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => context.go('/app/trips/detail/${item['bookingId']}'),
      child: Container(
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: Theme.of(context).colorScheme.surface,
          border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
        ),
        child: Row(
          children: [
            Stack(
              children: [
                SizedBox(
                  width: 112,
                  height: 120,
                  child: Image.asset(
                    item['heroImage'] as String? ?? '',
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      color: Theme.of(context).colorScheme.surfaceContainerHigh,
                    ),
                  ),
                ),
                Positioned(
                  left: 6,
                  top: 6,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(999),
                      color: Colors.black.withValues(alpha: 0.45),
                    ),
                    child: Text(
                      item['bookingType'] as String? ?? '',
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                  ),
                ),
              ],
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item['title'] as String? ?? '',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${item['city']} • $dateLabel • $timeLabel',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        _Badge(text: status, color: statusColor.withValues(alpha: 0.16)),
                        _Badge(
                          text: paymentStatus,
                          color: Theme.of(context)
                              .colorScheme
                              .surfaceContainerHighest
                              .withValues(alpha: 0.95),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            isPending ? 'Awaiting host confirmation' : 'Ready for your trip',
                            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                                  fontWeight: FontWeight.w700,
                                ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        TextButton(
                          onPressed: () => context.go('/app/trips/detail/${item['bookingId']}'),
                          child: const Text('Open'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({required this.text, required this.color});

  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: color,
      ),
      child: Text(
        text,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({
    required this.label,
    required this.value,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final String value;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final fg = selected
        ? Theme.of(context).colorScheme.onPrimaryContainer
        : Theme.of(context).colorScheme.onSurface;
    final mutedFg = selected
        ? Theme.of(context).colorScheme.onPrimaryContainer.withValues(alpha: 0.82)
        : Theme.of(context).colorScheme.onSurfaceVariant;
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 170),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          color: selected
              ? Theme.of(context).colorScheme.primaryContainer
              : Theme.of(context).colorScheme.surfaceContainerHigh,
          border: Border.all(
            color: selected
                ? Theme.of(context).colorScheme.primary
                : Colors.transparent,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 18, color: fg),
            const SizedBox(height: 6),
            Text(
              value,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w900,
                    color: fg,
                  ),
            ),
            Text(
              label,
              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: mutedFg,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NextTripHero extends StatelessWidget {
  const _NextTripHero({required this.item});

  final Map<String, dynamic> item;

  @override
  Widget build(BuildContext context) {
    final date = DateTime.tryParse(item['startAt'] as String? ?? '');
    final dateLabel = date != null ? '${date.day}/${date.month}' : 'Soon';
    final timeLabel = item['timeLabel'] as String? ?? 'Time TBD';

    return InkWell(
      onTap: () => context.go('/app/trips/detail/${item['bookingId']}'),
      borderRadius: BorderRadius.circular(18),
      child: Container(
        height: 210,
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(18),
        ),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              item['heroImage'] as String? ?? '',
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                color: Theme.of(context).colorScheme.surfaceContainerHighest,
              ),
            ),
            Container(color: Colors.black.withValues(alpha: 0.22)),
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withValues(alpha: 0.02),
                    Colors.black.withValues(alpha: 0.52),
                  ],
                ),
              ),
            ),
            Positioned(
              top: 12,
              left: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  'Next up • $dateLabel • $timeLabel',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
              ),
            ),
            Positioned(
              left: 12,
              right: 12,
              bottom: 12,
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item['title'] as String? ?? '',
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w900,
                              ),
                        ),
                        Text(
                          '${item['city']}',
                          style: Theme.of(context).textTheme.labelLarge?.copyWith(
                                color: Colors.white.withValues(alpha: 0.9),
                                fontWeight: FontWeight.w700,
                              ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(
                    width: 136,
                    child: FilledButton.tonalIcon(
                      onPressed: () => context.go('/app/trips/detail/${item['bookingId']}'),
                      icon: const Icon(Icons.route_rounded),
                      label: const Text('Itinerary'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
