import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_tokens.dart';
import '../../favorites/state/favorites_store.dart';
import '../../home/data/home_feed_mock.dart';

enum _ExploreSort { recommended, priceLow, ratingHigh }

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  final TextEditingController _searchCtrl = TextEditingController();
  final Set<String> _activeCategories = {};
  String _activeCity = 'All';
  _ExploreSort _sort = _ExploreSort.recommended;

  static const Map<String, String> _categoryByExperienceId = {
    'agafay-quad': 'Adventure',
    'atlas-hike': 'Nature',
    'taghazout-surf': 'Adventure',
    'medina-food-stories': 'Food',
    'marrakech-rooftop-dinner': 'Food',
    'agafay-camp-evening': 'Desert',
    'merzouga-camel-ride': 'Desert',
    'fes-cooking-class': 'Culture',
    'essaouira-ocean-grill': 'Food',
  };

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer(
      builder: (context, ref, _) {
        final all = _buildExploreItems();
        final filtered = _applyFilters(all);
        final savedIds = ref.watch(favoritesStoreProvider);
        final cities = <String>{
          'All',
          ...all.map((e) => e['city'] as String).where((c) => c.trim().isNotEmpty),
        }.toList();

        return Scaffold(
          appBar: AppBar(
            title: const Text('Explore'),
            actions: [
              IconButton(
                onPressed: () => context.go('/app/explore/favorites'),
                icon: Badge(
                  isLabelVisible: savedIds.isNotEmpty,
                  child: const Icon(Icons.favorite_border_rounded),
                ),
                tooltip: 'Saved experiences',
              ),
              PopupMenuButton<_ExploreSort>(
                initialValue: _sort,
                onSelected: (value) => setState(() => _sort = value),
                itemBuilder: (context) => const [
                  PopupMenuItem(value: _ExploreSort.recommended, child: Text('Recommended')),
                  PopupMenuItem(value: _ExploreSort.ratingHigh, child: Text('Top rated')),
                  PopupMenuItem(value: _ExploreSort.priceLow, child: Text('Price: low to high')),
                ],
                icon: const Icon(Icons.swap_vert_rounded),
              ),
            ],
          ),
          body: SafeArea(
            child: Stack(
              children: [
                Positioned(
                  left: 0,
                  right: 0,
                  top: 0,
                  child: IgnorePointer(
                    child: Container(
                      height: 220,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            AppTokens.forestDark.withValues(alpha: 0.08),
                            AppTokens.appBg.withValues(alpha: 0),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                ListView(
                  padding: const EdgeInsets.fromLTRB(16, 10, 16, 20),
                  children: [
                    Text(
                      'Find your perfect plan',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.w900,
                            fontSize: 34,
                          ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Search by city, vibe, and budget. Then book with confidence.',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.fromLTRB(12, 12, 12, 10),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(18),
                        color: Theme.of(context).colorScheme.surface,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.06),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          TextField(
                            controller: _searchCtrl,
                            onChanged: (_) => setState(() {}),
                            decoration: const InputDecoration(
                              hintText: 'Search experiences, cities, vibes...',
                              prefixIcon: Icon(Icons.search_rounded),
                            ),
                          ),
                          const SizedBox(height: 10),
                          SizedBox(
                            height: 40,
                            child: ListView(
                              scrollDirection: Axis.horizontal,
                              children: [
                                for (final city in cities)
                                  Padding(
                                    padding: const EdgeInsets.only(right: 8),
                                    child: ChoiceChip(
                                      label: Text(city),
                                      selected: _activeCity == city,
                                      onSelected: (_) => setState(() => _activeCity = city),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 8),
                          SizedBox(
                            height: 40,
                            child: ListView(
                              scrollDirection: Axis.horizontal,
                              children: [
                                for (final cat in ['Culture', 'Adventure', 'Food', 'Desert', 'Nature'])
                                  Padding(
                                    padding: const EdgeInsets.only(right: 8),
                                    child: FilterChip(
                                      label: Text(cat),
                                      selected: _activeCategories.contains(cat),
                                      onSelected: (selected) {
                                        setState(() {
                                          if (selected) {
                                            _activeCategories.add(cat);
                                          } else {
                                            _activeCategories.remove(cat);
                                          }
                                        });
                                      },
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Text(
                          '${filtered.length} results',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w900,
                              ),
                        ),
                        const Spacer(),
                        if (_activeCategories.isNotEmpty ||
                            _activeCity != 'All' ||
                            _searchCtrl.text.isNotEmpty)
                          TextButton(
                            onPressed: () {
                              setState(() {
                                _activeCategories.clear();
                                _activeCity = 'All';
                                _searchCtrl.clear();
                              });
                            },
                            child: const Text('Clear filters'),
                          ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    if (filtered.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          color: Theme.of(context).colorScheme.surfaceContainerHighest,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'No matches found',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.w900,
                                  ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Try another city, remove a filter, or search with fewer words.',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                                  ),
                            ),
                          ],
                        ),
                      ),
                    for (final item in filtered) ...[
                      _ExploreResultCard(
                        item: item,
                        isSaved: savedIds.contains(item['id']),
                        onToggleSaved: () => ref
                            .read(favoritesStoreProvider.notifier)
                            .toggle(item['id'] as String),
                      ),
                      const SizedBox(height: 12),
                    ],
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  List<Map<String, dynamic>> _buildExploreItems() {
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
        'priceFromMad': (raw['priceFromMad'] as num?)?.round() ?? 0,
        'rating': (raw['rating'] as num?)?.toDouble() ?? 4.6,
        'verified': raw['verified'] == true,
        'image': raw['image'] as String?,
        'category': _categoryByExperienceId[id] ?? 'Culture',
      });
    }
    return result;
  }

  List<Map<String, dynamic>> _applyFilters(List<Map<String, dynamic>> list) {
    final query = _searchCtrl.text.trim().toLowerCase();
    final filtered = list.where((item) {
      final city = (item['city'] as String).toLowerCase();
      final title = (item['title'] as String).toLowerCase();
      final category = item['category'] as String;
      final queryPass = query.isEmpty || title.contains(query) || city.contains(query);
      final cityPass = _activeCity == 'All' || (item['city'] as String) == _activeCity;
      final categoryPass = _activeCategories.isEmpty || _activeCategories.contains(category);
      return queryPass && cityPass && categoryPass;
    }).toList();

    switch (_sort) {
      case _ExploreSort.priceLow:
        filtered.sort((a, b) => (a['priceFromMad'] as int).compareTo(b['priceFromMad'] as int));
      case _ExploreSort.ratingHigh:
        filtered.sort((a, b) => (b['rating'] as double).compareTo(a['rating'] as double));
      case _ExploreSort.recommended:
        filtered.sort((a, b) {
          final av = (a['verified'] == true ? 1 : 0) + ((a['rating'] as double) * 10).round();
          final bv = (b['verified'] == true ? 1 : 0) + ((b['rating'] as double) * 10).round();
          return bv.compareTo(av);
        });
    }
    return filtered;
  }
}

class _ExploreResultCard extends StatelessWidget {
  const _ExploreResultCard({
    required this.item,
    required this.isSaved,
    required this.onToggleSaved,
  });

  final Map<String, dynamic> item;
  final bool isSaved;
  final VoidCallback onToggleSaved;

  @override
  Widget build(BuildContext context) {
    final verified = item['verified'] == true;
    final rating = item['rating'] as double? ?? 4.6;
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => context.go('/app/home/experience/${item['id']}'),
      child: Container(
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(18),
          color: Theme.of(context).colorScheme.surface,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.07),
              blurRadius: 18,
              offset: const Offset(0, 7),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 16 / 9,
                  child: Image.asset(
                    item['image'] as String? ?? '',
                    fit: BoxFit.cover,
                    alignment: Alignment.topCenter,
                    errorBuilder: (_, __, ___) =>
                        Container(color: Theme.of(context).colorScheme.surfaceContainerHigh),
                  ),
                ),
                Positioned(
                  left: 10,
                  top: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.45),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      item['category'] as String,
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                  ),
                ),
                Positioned(
                  right: 10,
                  top: 10,
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTokens.brandAccent.withValues(alpha: 0.88),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          'Popular this week',
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                              ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Material(
                        color: Colors.black.withValues(alpha: 0.35),
                        borderRadius: BorderRadius.circular(999),
                        child: InkWell(
                          onTap: onToggleSaved,
                          borderRadius: BorderRadius.circular(999),
                          child: Padding(
                            padding: const EdgeInsets.all(6),
                            child: Icon(
                              isSaved ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                              size: 18,
                              color: isSaved ? AppTokens.brandAccent : Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item['title'] as String,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w900,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${item['city']} • ${item['duration']}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      if (verified)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(999),
                            color: AppTokens.success.withValues(alpha: 0.16),
                          ),
                          child: Text(
                            'Verified operator',
                            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                  fontWeight: FontWeight.w700,
                                ),
                          ),
                        ),
                      if (verified) const SizedBox(width: 8),
                      Icon(Icons.star_rounded, color: AppTokens.brandAccent, size: 18),
                      const SizedBox(width: 3),
                      Text(
                        rating.toStringAsFixed(1),
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                      const Spacer(),
                      Text(
                        'From ${item['priceFromMad']} MAD',
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w900,
                            ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Align(
                    alignment: Alignment.centerRight,
                    child: Text(
                      'View details',
                      style: Theme.of(context).textTheme.labelLarge?.copyWith(
                            fontWeight: FontWeight.w800,
                            color: AppTokens.brandPrimary,
                          ),
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
