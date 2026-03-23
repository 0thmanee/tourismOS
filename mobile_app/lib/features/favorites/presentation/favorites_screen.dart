import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_tokens.dart';
import '../../favorites/state/favorites_store.dart';
import '../../home/data/home_feed_mock.dart';

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final savedIds = ref.watch(favoritesStoreProvider);
    final all = _allExploreItems();
    final saved = all.where((e) => savedIds.contains(e['id'])).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Saved experiences')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
          children: [
            Text(
              'Your favorites',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                    fontSize: 34,
                  ),
            ),
            const SizedBox(height: 6),
            Text(
              'Save now, decide later. Reopen these quickly when you are ready to book.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 14),
            if (saved.isEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  color: Theme.of(context).colorScheme.surfaceContainerHighest,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'No saved experiences yet',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Tap the heart icon in Explore or Experience Detail to build your shortlist.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                    ),
                    const SizedBox(height: 10),
                    FilledButton.tonal(
                      onPressed: () => context.go('/app/explore'),
                      child: const Text('Browse Explore'),
                    ),
                  ],
                ),
              ),
            for (final item in saved) ...[
              _SavedCard(item: item),
              const SizedBox(height: 10),
            ],
          ],
        ),
      ),
    );
  }
}

class _SavedCard extends ConsumerWidget {
  const _SavedCard({required this.item});

  final Map<String, dynamic> item;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return InkWell(
      onTap: () => context.go('/app/home/experience/${item['id']}'),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: Theme.of(context).colorScheme.surface,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 14,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Row(
          children: [
            SizedBox(
              width: 108,
              height: 108,
              child: Image.asset(
                item['image'] as String? ?? '',
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) =>
                    Container(color: Theme.of(context).colorScheme.surfaceContainerHigh),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item['title'] as String,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text('${item['city']} • ${item['duration']}'),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Icon(Icons.star_rounded, color: AppTokens.brandAccent, size: 18),
                        Text((item['rating'] as double).toStringAsFixed(1)),
                        const Spacer(),
                        IconButton(
                          onPressed: () => ref
                              .read(favoritesStoreProvider.notifier)
                              .toggle(item['id'] as String),
                          icon: const Icon(Icons.favorite_rounded),
                          color: AppTokens.brandAccent,
                          tooltip: 'Remove',
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

List<Map<String, dynamic>> _allExploreItems() {
  final all = [
    ...HomeFeedMock.featuredFallback(),
    ...HomeFeedMock.curated('Best in Marrakech'),
    ...HomeFeedMock.curated('Desert escapes'),
    ...HomeFeedMock.curated('Authentic food'),
  ];
  final seen = <String>{};
  final result = <Map<String, dynamic>>[];
  for (final raw in all) {
    final id = raw['id'] as String? ?? '';
    if (id.isEmpty || seen.contains(id)) continue;
    seen.add(id);
    result.add({
      'id': id,
      'title': raw['title'] as String? ?? 'Experience',
      'city': raw['city'] as String? ?? '',
      'duration': raw['duration'] as String? ?? '',
      'rating': (raw['rating'] as num?)?.toDouble() ?? 4.6,
      'image': raw['image'] as String?,
    });
  }
  return result;
}
