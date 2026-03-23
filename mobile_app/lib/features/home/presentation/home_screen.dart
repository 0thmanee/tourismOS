import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_tokens.dart';
import '../../favorites/state/favorites_store.dart';
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
    'id': raw['id'] ?? '',
    'title': raw['title'] ?? 'Experience',
    'city': raw['city'] ?? '',
    'duration': raw['duration'] ?? '',
    'priceFromMad': priceMad,
    'verified': raw['verified'] == true,
    'rating': raw['rating'] is num ? (raw['rating'] as num).toDouble() : null,
    'image': raw['image'] as String?,
  };
}

IconData _categoryIcon(String? key) {
  switch (key) {
    case 'museum':
      return Icons.mosque_rounded;
    case 'terrain':
      return Icons.landscape_rounded;
    case 'restaurant':
      return Icons.restaurant_menu_rounded;
    case 'wb_sunny':
      return Icons.wb_sunny_rounded;
    case 'surfing':
      return Icons.kayaking_rounded;
    case 'forest':
      return Icons.forest_rounded;
    default:
      return Icons.explore_rounded;
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isInitialLoading = true;

  @override
  void initState() {
    super.initState();
    _runInitialLoading(fromInit: true);
  }

  void _runInitialLoading({bool fromInit = false}) {
    if (!fromInit) {
      setState(() => _isInitialLoading = true);
    }
    Future<void>.delayed(const Duration(milliseconds: 650), () {
      if (!mounted) return;
      setState(() => _isInitialLoading = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final featured = HomeFeedMock.featuredFallback().map(_normalizeExperience).toList();
    final hasContent = featured.isNotEmpty;
    return Scaffold(
      body: SafeArea(
        child: Consumer(
          builder: (context, ref, _) {
            final savedIds = ref.watch(favoritesStoreProvider);
            final savedItems = _allHomeExperiences()
                .where((item) => savedIds.contains(item['id']))
                .take(3)
                .toList();
            if (_isInitialLoading) {
              return const _HomeLoadingView();
            }
            if (!hasContent) {
              return _HomeStateCard(
                title: 'Home is temporarily unavailable',
                message:
                    'We could not load recommendations right now. Please retry or explore manually.',
                primaryLabel: 'Retry',
                onPrimary: _runInitialLoading,
                secondaryLabel: 'Browse Explore',
                onSecondary: () => context.go('/app/explore'),
              );
            }
            return CustomScrollView(
              slivers: [
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
              sliver: SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Discover Morocco',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            fontSize: 40,
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Big moments. Clear booking. Beautiful journeys.',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                    ),
                    const SizedBox(height: 16),
                    _HeroMediaCard(
                      imageAsset: HomeFeedMock.hero['image'] as String,
                      title: HomeFeedMock.hero['title'] as String,
                      subtitle: HomeFeedMock.hero['subtitle'] as String,
                      ctaPrimary: HomeFeedMock.hero['ctaPrimary'] as String,
                      ctaSecondary: HomeFeedMock.hero['ctaSecondary'] as String,
                      onPrimary: () => context.go(
                        '/app/home/experience/${HomeFeedMock.hero['experienceId']}',
                      ),
                      onSecondary: () => context.go('/app/trips'),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: _QuickActionCard(
                            title: HomeFeedMock.quickActions[0]['title'] as String,
                            subtitle:
                                HomeFeedMock.quickActions[0]['subtitle'] as String,
                            imageAsset:
                                HomeFeedMock.quickActions[0]['image'] as String,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _QuickActionCard(
                            title: HomeFeedMock.quickActions[1]['title'] as String,
                            subtitle:
                                HomeFeedMock.quickActions[1]['subtitle'] as String,
                            imageAsset:
                                HomeFeedMock.quickActions[1]['image'] as String,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Material(
                      color: Theme.of(context).colorScheme.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(16),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(16),
                        onTap: () => context.go('/app/explore'),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 14,
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
                                  'Search experiences, cities, categories…',
                                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                        fontWeight: FontWeight.w700,
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
              child: SizedBox(
                height: 290,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  scrollDirection: Axis.horizontal,
                  itemCount: featured.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
                  itemBuilder: (context, i) {
                    final e = featured[i];
                    return ExperienceCard(
                      title: e['title'] as String,
                      city: e['city'] as String,
                      duration: e['duration'] as String,
                      priceFromMad: e['priceFromMad'] as int,
                      imageAsset: e['image'] as String?,
                      verified: e['verified'] as bool,
                      rating: e['rating'] as double?,
                      onTap: () =>
                          context.go('/app/home/experience/${e['id'] as String}'),
                    );
                  },
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
                height: 112,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  scrollDirection: Axis.horizontal,
                  itemCount: HomeFeedMock.categories.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 10),
                  itemBuilder: (context, i) {
                    final c = HomeFeedMock.categories[i];
                    return InkWell(
                      onTap: () => context.go('/app/explore'),
                      borderRadius: BorderRadius.circular(18),
                      child: Container(
                        width: 112,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(18),
                          color: const Color(0xFF0F231E),
                          border: Border.all(
                            color: AppTokens.brandAccent.withValues(alpha: 0.24),
                            width: 0.8,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.16),
                              blurRadius: 16,
                              offset: const Offset(0, 7),
                            ),
                          ],
                        ),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 12,
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 42,
                                height: 42,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF17342D),
                                  borderRadius: BorderRadius.circular(13),
                                  border: Border.all(
                                    color: AppTokens.brandAccent.withValues(alpha: 0.3),
                                    width: 0.7,
                                  ),
                                ),
                                alignment: Alignment.center,
                                child: Icon(
                                  _categoryIcon(c['icon'] as String?),
                                  color: AppTokens.brandAccent,
                                  size: 22,
                                ),
                              ),
                              const SizedBox(height: 9),
                              Text(
                                c['label'] as String? ?? '',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 0.1,
                                      color: const Color(0xFFF7F3EA),
                                    ),
                              ),
                            ],
                          ),
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
                height: 170,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  scrollDirection: Axis.horizontal,
                  itemCount: HomeFeedMock.cities.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
                  itemBuilder: (context, i) {
                    final city = HomeFeedMock.cities[i]['name'] as String;
                    final imageAsset = HomeFeedMock.cities[i]['image'] as String?;
                    return InkWell(
                      onTap: () => context.go('/app/explore'),
                      borderRadius: BorderRadius.circular(18),
                      child: Container(
                        width: 220,
                        clipBehavior: Clip.antiAlias,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            if (imageAsset != null)
                              Image.asset(
                                imageAsset,
                                fit: BoxFit.cover,
                                alignment: Alignment.topCenter,
                                errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                              ),
                            Container(
                              color: Colors.black.withValues(alpha: 0.18),
                            ),
                            DecoratedBox(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  colors: [
                                    Colors.black.withValues(alpha: 0),
                                    Colors.black.withValues(alpha: 0.44),
                                  ],
                                ),
                              ),
                            ),
                            Positioned(
                              left: 12,
                              right: 12,
                              bottom: 12,
                              child: Text(
                                city,
                                style:
                                    Theme.of(context).textTheme.titleLarge?.copyWith(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w900,
                                          fontSize: 26,
                                        ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 20)),
            if (savedItems.isNotEmpty) ...[
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: SectionHeader(
                    title: 'Saved for later',
                    actionLabel: 'See all',
                    onAction: () => context.go('/app/explore/favorites'),
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 290,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    scrollDirection: Axis.horizontal,
                    itemCount: savedItems.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 12),
                    itemBuilder: (context, i) {
                      final e = savedItems[i];
                      return ExperienceCard(
                        title: e['title'] as String,
                        city: e['city'] as String,
                        duration: e['duration'] as String,
                        priceFromMad: e['priceFromMad'] as int,
                        imageAsset: e['image'] as String?,
                        verified: e['verified'] as bool,
                        rating: e['rating'] as double?,
                        onTap: () =>
                            context.go('/app/home/experience/${e['id'] as String}'),
                      );
                    },
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 20)),
            ],
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
                  height: 290,
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
                            imageAsset: e['image'] as String?,
                            verified: e['verified'] as bool,
                            rating: e['rating'] as double?,
                            onTap: () =>
                                context.go('/app/home/experience/${e['id'] as String}'),
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
            );
          },
        ),
      ),
    );
  }
}

class _HomeLoadingView extends StatelessWidget {
  const _HomeLoadingView();

  @override
  Widget build(BuildContext context) {
    final base = Theme.of(context).colorScheme.surfaceContainerHighest;
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
      children: [
        Container(height: 34, width: 240, color: base),
        const SizedBox(height: 8),
        Container(height: 14, width: 280, color: base),
        const SizedBox(height: 14),
        Container(height: 290, color: base),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: Container(height: 140, color: base)),
            const SizedBox(width: 10),
            Expanded(child: Container(height: 140, color: base)),
          ],
        ),
        const SizedBox(height: 14),
        Container(height: 54, color: base),
      ],
    );
  }
}

class _HomeStateCard extends StatelessWidget {
  const _HomeStateCard({
    required this.title,
    required this.message,
    required this.primaryLabel,
    required this.onPrimary,
    required this.secondaryLabel,
    required this.onSecondary,
  });

  final String title;
  final String message;
  final String primaryLabel;
  final VoidCallback onPrimary;
  final String secondaryLabel;
  final VoidCallback onSecondary;

  @override
  Widget build(BuildContext context) {
    return Center(
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
              FilledButton(onPressed: onPrimary, child: Text(primaryLabel)),
              TextButton(onPressed: onSecondary, child: Text(secondaryLabel)),
            ],
          ),
        ),
      ),
    );
  }
}

List<Map<String, dynamic>> _allHomeExperiences() {
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
    result.add(_normalizeExperience(raw));
  }
  return result;
}

class _HeroMediaCard extends StatelessWidget {
  const _HeroMediaCard({
    required this.imageAsset,
    required this.title,
    required this.subtitle,
    required this.ctaPrimary,
    required this.ctaSecondary,
    required this.onPrimary,
    required this.onSecondary,
  });

  final String imageAsset;
  final String title;
  final String subtitle;
  final String ctaPrimary;
  final String ctaSecondary;
  final VoidCallback onPrimary;
  final VoidCallback onSecondary;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(22)),
            child: SizedBox(
              height: 245,
              width: double.infinity,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Image.asset(
                    imageAsset,
                    fit: BoxFit.cover,
                    alignment: Alignment.topCenter,
                    errorBuilder: (_, __, ___) => Container(color: AppTokens.forestMid),
                  ),
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withValues(alpha: 0.02),
                          Colors.black.withValues(alpha: 0.22),
                        ],
                      ),
                    ),
                  ),
                  Positioned(
                    left: 12,
                    top: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.88),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        'Editor\'s pick',
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontSize: 31,
                        fontWeight: FontWeight.w900,
                      ),
                ),
                const SizedBox(height: 6),
                Text(
                  subtitle,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: FilledButton(
                        onPressed: onPrimary,
                        child: Text(ctaPrimary),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton(
                        onPressed: onSecondary,
                        child: Text(ctaSecondary),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  const _QuickActionCard({
    required this.title,
    required this.subtitle,
    required this.imageAsset,
  });

  final String title;
  final String subtitle;
  final String imageAsset;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {},
      borderRadius: BorderRadius.circular(16),
      child: Container(
        height: 140,
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
        ),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              imageAsset,
              fit: BoxFit.cover,
              alignment: Alignment.topCenter,
              errorBuilder: (_, __, ___) => Container(color: AppTokens.forestMid),
            ),
            Container(color: Colors.black.withValues(alpha: 0.22)),
            Positioned(
              left: 10,
              right: 10,
              bottom: 10,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontSize: 20,
                        ),
                  ),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.white.withValues(alpha: 0.9),
                          fontWeight: FontWeight.w700,
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
