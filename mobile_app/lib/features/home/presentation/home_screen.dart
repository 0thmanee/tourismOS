import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/state/launch_providers.dart';
import '../../experiences/state/experiences_providers.dart';
import '../data/home_feed_mock.dart';
import 'widgets/experience_card.dart';
import 'widgets/section_header.dart';

Map<String, dynamic> _normalizeExperience(Map<String, dynamic> raw) {
  int priceMad = 0;
  if (raw['priceFromMad'] is num) {
    priceMad = (raw['priceFromMad'] as num).round();
  } else if (raw['priceMad'] is num) {
    priceMad = (raw['priceMad'] as num).round();
  } else if (raw['priceCents'] is num) {
    priceMad = ((raw['priceCents'] as num) / 100).round();
  }
  return {
    'title': raw['title'] ?? 'Experience',
    'city': raw['city'] ?? '',
    'duration': raw['duration'] ?? '',
    'priceFromMad': priceMad,
    'verified': raw['verified'] == true,
    'rating': raw['rating'] is num ? (raw['rating'] as num).toDouble() : null,
  };
}

IconData _categoryIcon(String? key) {
  switch (key) {
    case 'museum':
      return Icons.museum_outlined;
    case 'terrain':
      return Icons.terrain_outlined;
    case 'restaurant':
      return Icons.restaurant_outlined;
    case 'wb_sunny':
      return Icons.wb_sunny_outlined;
    case 'surfing':
      return Icons.surfing_outlined;
    case 'forest':
      return Icons.forest_outlined;
    default:
      return Icons.category_outlined;
  }
}

/// Home: greeting, search → Explore, featured carousel, categories, cities, curated lists.
///
/// States: skeleton loading, empty fallback, inline API error with retry.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final featuredAsync = ref.watch(featuredExperiencesProvider);
    final launch = ref.watch(launchControllerProvider);
    final cityHint = launch.preferredCity;

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(featuredExperiencesProvider);
            await ref.read(featuredExperiencesProvider.future);
          },
          child: CustomScrollView(
            slivers: [
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                sliver: SliverToBoxAdapter(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Discover Morocco',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        cityHint != null
                            ? 'Ideas for $cityHint — plus more destinations below.'
                            : 'Find unforgettable local experiences',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                      ),
                      const SizedBox(height: 16),
                      Material(
                        color: Theme.of(context).colorScheme.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(14),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(14),
                          onTap: () => context.go('/app/explore'),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 12,
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.search,
                                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    'Search experiences, cities…',
                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                          color: Theme.of(context)
                                              .colorScheme
                                              .onSurfaceVariant,
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
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 20)),
              SliverToBoxAdapter(
                child: SectionHeader(
                  title: 'Featured experiences',
                  actionLabel: 'See all',
                  onAction: () => context.go('/app/explore'),
                ),
              ),
              SliverToBoxAdapter(
                child: featuredAsync.when(
                  data: (items) {
                    final list = items.isEmpty
                        ? HomeFeedMock.featuredFallback()
                        : items.map(_normalizeExperience).toList();
                    return SizedBox(
                      height: 268,
                      child: ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        scrollDirection: Axis.horizontal,
                        itemCount: list.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 12),
                        itemBuilder: (context, i) {
                          final e = list[i];
                          return ExperienceCard(
                            title: e['title'] as String,
                            city: e['city'] as String,
                            duration: e['duration'] as String,
                            priceFromMad: e['priceFromMad'] as int,
                            verified: e['verified'] as bool,
                            rating: e['rating'] as double?,
                            onTap: () {
                              /* Experience detail — next slice */
                            },
                          );
                        },
                      ),
                    );
                  },
                  loading: () => SizedBox(
                    height: 268,
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      scrollDirection: Axis.horizontal,
                      itemCount: 3,
                      separatorBuilder: (_, __) => const SizedBox(width: 12),
                      itemBuilder: (_, __) => const _CardSkeleton(),
                    ),
                  ),
                  error: (err, __) => Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          'Could not load featured list.',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '$err',
                          maxLines: 5,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: Theme.of(context).colorScheme.error,
                              ),
                        ),
                        const SizedBox(height: 8),
                        FilledButton.tonal(
                          onPressed: () =>
                              ref.invalidate(featuredExperiencesProvider),
                          child: const Text('Retry'),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          height: 268,
                          child: ListView.separated(
                            padding: EdgeInsets.zero,
                            scrollDirection: Axis.horizontal,
                            itemCount: HomeFeedMock.featuredFallback().length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(width: 12),
                            itemBuilder: (context, i) {
                              final e = _normalizeExperience(
                                HomeFeedMock.featuredFallback()[i],
                              );
                              return ExperienceCard(
                                title: e['title'] as String,
                                city: e['city'] as String,
                                duration: e['duration'] as String,
                                priceFromMad: e['priceFromMad'] as int,
                                verified: e['verified'] as bool,
                                rating: e['rating'] as double?,
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 8)),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: SectionHeader(
                    title: 'Categories',
                    actionLabel: 'Explore',
                    onAction: () => context.go('/app/explore'),
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 96,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    scrollDirection: Axis.horizontal,
                    itemCount: HomeFeedMock.categories.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 10),
                    itemBuilder: (context, i) {
                      final c = HomeFeedMock.categories[i];
                      return InkWell(
                        onTap: () => context.go('/app/explore'),
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          width: 84,
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: Theme.of(context).colorScheme.outlineVariant,
                            ),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                _categoryIcon(c['icon'] as String?),
                                color: Theme.of(context).colorScheme.primary,
                              ),
                              const SizedBox(height: 6),
                              Text(
                                c['label'] as String? ?? '',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: Theme.of(context).textTheme.labelSmall,
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 12)),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: const SectionHeader(title: 'Popular cities'),
                ),
              ),
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 120,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    scrollDirection: Axis.horizontal,
                    itemCount: HomeFeedMock.cities.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 12),
                    itemBuilder: (context, i) {
                      final city = HomeFeedMock.cities[i]['name'] as String;
                      return InkWell(
                        onTap: () => context.go('/app/explore'),
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          width: 160,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            gradient: LinearGradient(
                              colors: [
                                Theme.of(context)
                                    .colorScheme
                                    .primaryContainer
                                    .withValues(alpha: 0.9),
                                Theme.of(context)
                                    .colorScheme
                                    .secondaryContainer
                                    .withValues(alpha: 0.5),
                              ],
                            ),
                          ),
                          child: Text(
                            city,
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w800,
                                ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 20)),
              for (final section in [
                'Best in Marrakech',
                'Desert escapes',
                'Authentic food',
              ]) ...[
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: SectionHeader(title: section),
                  ),
                ),
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 268,
                    child: Builder(
                      builder: (context) {
                        final items = HomeFeedMock.curated(section);
                        return ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          scrollDirection: Axis.horizontal,
                          itemCount: items.length,
                          separatorBuilder: (_, __) => const SizedBox(width: 12),
                          itemBuilder: (context, i) {
                            final e = _normalizeExperience(items[i]);
                            return ExperienceCard(
                              title: e['title'] as String,
                              city: e['city'] as String,
                              duration: e['duration'] as String,
                              priceFromMad: e['priceFromMad'] as int,
                              verified: e['verified'] as bool,
                              rating: e['rating'] as double?,
                            );
                          },
                        );
                      },
                    ),
                  ),
                ),
                const SliverToBoxAdapter(child: SizedBox(height: 16)),
              ],
              const SliverToBoxAdapter(child: SizedBox(height: 32)),
            ],
          ),
        ),
      ),
    );
  }
}

class _CardSkeleton extends StatelessWidget {
  const _CardSkeleton();

  @override
  Widget build(BuildContext context) {
    final base = Theme.of(context).colorScheme.surfaceContainerHighest;
    return SizedBox(
      width: 260,
      child: Card(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 16 / 10,
              child: Container(color: base),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(height: 14, width: 180, color: base),
                  const SizedBox(height: 8),
                  Container(height: 12, width: 120, color: base),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
