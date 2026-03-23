import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_tokens.dart';
import '../../favorites/state/favorites_store.dart';
import '../../home/data/home_feed_mock.dart';

enum _ExploreSort { recommended, priceLow, ratingHigh }
enum _PriceRange { any, under300, between300600, between6001000, over1000 }

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
  _PriceRange _priceRange = _PriceRange.any;
  bool _isInitialLoading = true;
  static const List<String> _categories = [
    'Culture',
    'Adventure',
    'Food',
    'Desert',
    'Nature',
  ];

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
  void initState() {
    super.initState();
    // Lightweight simulated loading so the skeleton state is visible.
    Future<void>.delayed(const Duration(milliseconds: 700), () {
      if (!mounted) return;
      setState(() => _isInitialLoading = false);
    });
  }

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
            ],
          ),
          body: SafeArea(
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.fromLTRB(16, 10, 16, 0),
                    padding: const EdgeInsets.fromLTRB(0, 0, 0, 10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
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
                          padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
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
                              if (_searchCtrl.text.trim().isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Align(
                                  alignment: Alignment.centerLeft,
                                  child: Text(
                                    'Searching for "${_searchCtrl.text.trim()}"',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                                          color: Theme.of(context)
                                              .colorScheme
                                              .onSurfaceVariant,
                                          fontWeight: FontWeight.w600,
                                        ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                SliverPersistentHeader(
                  pinned: true,
                  delegate: _ExploreStickyFiltersDelegate(
                    minExtentHeight: 40,
                    maxExtentHeight: 40,
                    child: Container(
                      color: Theme.of(context).scaffoldBackgroundColor,
                      padding: const EdgeInsets.fromLTRB(16, 2, 16, 2),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(8, 2, 8, 2),
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.surface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: Theme.of(context)
                                  .colorScheme
                                  .outlineVariant
                                  .withValues(alpha: 0.55),
                            ),
                          ),
                          child: SizedBox(
                            height: 30,
                            child: ListView(
                              scrollDirection: Axis.horizontal,
                              children: [
                                  Padding(
                                    padding: const EdgeInsets.only(right: 8),
                                    child: _CompactFilterButton(
                                      icon: Icons.location_on_outlined,
                                      label: _activeCity == 'All' ? 'City' : _activeCity,
                                      isActive: _activeCity != 'All',
                                      onTap: () async {
                                        final selected =
                                            await showModalBottomSheet<String>(
                                          context: context,
                                          showDragHandle: true,
                                          builder: (context) => _SingleSelectSheet<String>(
                                            title: 'City',
                                            selected: _activeCity,
                                            options: cities,
                                            labelBuilder: (value) => value,
                                          ),
                                        );
                                        if (selected != null) {
                                          setState(() => _activeCity = selected);
                                        }
                                      },
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.only(right: 8),
                                    child: _CompactFilterButton(
                                      icon: Icons.grid_view_rounded,
                                      label: _activeCategories.isEmpty
                                          ? 'Category'
                                          : _activeCategories.first,
                                      isActive: _activeCategories.isNotEmpty,
                                      onTap: () async {
                                        final selected =
                                            await showModalBottomSheet<String>(
                                          context: context,
                                          showDragHandle: true,
                                          builder: (context) => _SingleSelectSheet<String>(
                                            title: 'Category',
                                            selected: _activeCategories.isEmpty
                                                ? 'All'
                                                : _activeCategories.first,
                                            options: const ['All', ..._categories],
                                            labelBuilder: (value) => value,
                                          ),
                                        );
                                        if (selected != null) {
                                          setState(() {
                                            _activeCategories.clear();
                                            if (selected != 'All') {
                                              _activeCategories.add(selected);
                                            }
                                          });
                                        }
                                      },
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.only(right: 8),
                                    child: _CompactFilterButton(
                                      icon: Icons.tune_rounded,
                                      label: _priceRange == _PriceRange.any
                                          ? 'Price'
                                          : _priceRangeLabel(_priceRange),
                                      isActive: _priceRange != _PriceRange.any,
                                      onTap: () async {
                                        final selected =
                                            await showModalBottomSheet<_PriceRange>(
                                          context: context,
                                          showDragHandle: true,
                                          builder: (context) =>
                                              _SingleSelectSheet<_PriceRange>(
                                            title: 'Price range',
                                            selected: _priceRange,
                                            options: _PriceRange.values,
                                            labelBuilder: _priceRangeLabel,
                                          ),
                                        );
                                        if (selected != null) {
                                          setState(() => _priceRange = selected);
                                        }
                                      },
                                    ),
                                  ),
                                  _CompactFilterButton(
                                    icon: Icons.swap_vert_rounded,
                                    label: _sortLabel(_sort),
                                    isActive: _sort != _ExploreSort.recommended,
                                    onTap: () async {
                                      final selected =
                                          await showModalBottomSheet<_ExploreSort>(
                                        context: context,
                                        showDragHandle: true,
                                        builder: (context) =>
                                            _SingleSelectSheet<_ExploreSort>(
                                          title: 'Sort by',
                                          selected: _sort,
                                          options: _ExploreSort.values,
                                          labelBuilder: _sortLabel,
                                        ),
                                      );
                                      if (selected != null) {
                                        setState(() => _sort = selected);
                                      }
                                    },
                                  ),
                                  if (_activeCategories.isNotEmpty ||
                                      _activeCity != 'All' ||
                                      _searchCtrl.text.isNotEmpty ||
                                      _priceRange != _PriceRange.any ||
                                      _sort != _ExploreSort.recommended)
                                    Padding(
                                      padding: const EdgeInsets.only(left: 8),
                                      child: ActionChip(
                                        avatar: const Icon(Icons.close_rounded, size: 16),
                                        label: const Text('Clear'),
                                        onPressed: () {
                                          setState(() {
                                            _activeCategories.clear();
                                            _activeCity = 'All';
                                            _searchCtrl.clear();
                                            _priceRange = _PriceRange.any;
                                            _sort = _ExploreSort.recommended;
                                          });
                                        },
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                    child: Row(
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
                            _searchCtrl.text.isNotEmpty ||
                            _priceRange != _PriceRange.any ||
                            _sort != _ExploreSort.recommended)
                          TextButton(
                            onPressed: () {
                              setState(() {
                                _activeCategories.clear();
                                _activeCity = 'All';
                                _searchCtrl.clear();
                                _priceRange = _PriceRange.any;
                                _sort = _ExploreSort.recommended;
                              });
                            },
                            child: const Text('Clear filters'),
                          ),
                      ],
                    ),
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 6),
                    child: Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        if (_activeCity != 'All')
                          _ActiveTag(
                            text: 'City: $_activeCity',
                            onRemove: () => setState(() => _activeCity = 'All'),
                          ),
                        for (final c in _activeCategories)
                          _ActiveTag(
                            text: c,
                            onRemove: () => setState(() => _activeCategories.remove(c)),
                          ),
                        if (_priceRange != _PriceRange.any)
                          _ActiveTag(
                            text: 'Price: ${_priceRangeLabel(_priceRange)}',
                            onRemove: () => setState(() => _priceRange = _PriceRange.any),
                          ),
                        if (_sort != _ExploreSort.recommended)
                          _ActiveTag(
                            text: 'Sort: ${_sortLabel(_sort)}',
                            onRemove: () =>
                                setState(() => _sort = _ExploreSort.recommended),
                          ),
                      ],
                    ),
                  ),
                ),
                if (_isInitialLoading)
                  const SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.fromLTRB(16, 6, 16, 0),
                      child: Column(
                        children: [
                          _ExploreResultSkeletonCard(),
                          SizedBox(height: 12),
                          _ExploreResultSkeletonCard(),
                          SizedBox(height: 12),
                          _ExploreResultSkeletonCard(),
                        ],
                      ),
                    ),
                  )
                else if (filtered.isEmpty)
                  SliverToBoxAdapter(
                    child: Container(
                      margin: const EdgeInsets.fromLTRB(16, 6, 16, 0),
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
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              OutlinedButton(
                                onPressed: () {
                                  setState(() {
                                    _activeCategories.clear();
                                    _activeCity = 'All';
                                    _searchCtrl.clear();
                                    _priceRange = _PriceRange.any;
                                    _sort = _ExploreSort.recommended;
                                  });
                                },
                                child: const Text('Clear filters'),
                              ),
                              OutlinedButton(
                                onPressed: () {
                                  final alt = cities
                                      .where((c) => c != 'All' && c != _activeCity)
                                      .toList();
                                  if (alt.isEmpty) return;
                                  setState(() => _activeCity = alt.first);
                                },
                                child: const Text('Try another city'),
                              ),
                              FilledButton.tonal(
                                onPressed: () {
                                  setState(() {
                                    _activeCategories.clear();
                                    _activeCity = 'All';
                                    _searchCtrl.clear();
                                    _priceRange = _PriceRange.any;
                                    _sort = _ExploreSort.recommended;
                                  });
                                },
                                child: const Text('Browse popular experiences'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                if (!_isInitialLoading)
                  SliverList.separated(
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final item = filtered[index];
                    final isSaved = savedIds.contains(item['id']);
                    return Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
                      child: _ExploreResultCard(
                        item: item,
                        isSaved: isSaved,
                        onToggleSaved: () {
                          ref
                              .read(favoritesStoreProvider.notifier)
                              .toggle(item['id'] as String);
                          ScaffoldMessenger.of(context).hideCurrentSnackBar();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              duration: const Duration(milliseconds: 1200),
                              content: Text(
                                isSaved ? 'Removed from saved' : 'Saved for later',
                              ),
                            ),
                          );
                        },
                      ),
                    );
                  },
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                ),
                const SliverToBoxAdapter(child: SizedBox(height: 20)),
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
      final price = item['priceFromMad'] as int;
      final pricePass = switch (_priceRange) {
        _PriceRange.any => true,
        _PriceRange.under300 => price < 300,
        _PriceRange.between300600 => price >= 300 && price <= 600,
        _PriceRange.between6001000 => price > 600 && price <= 1000,
        _PriceRange.over1000 => price > 1000,
      };
      return queryPass && cityPass && categoryPass && pricePass;
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

String _priceRangeLabel(_PriceRange range) {
  return switch (range) {
    _PriceRange.any => 'Any price',
    _PriceRange.under300 => 'Under 300 MAD',
    _PriceRange.between300600 => '300-600 MAD',
    _PriceRange.between6001000 => '600-1000 MAD',
    _PriceRange.over1000 => '1000+ MAD',
  };
}

String _sortLabel(_ExploreSort sort) {
  return switch (sort) {
    _ExploreSort.recommended => 'Recommended',
    _ExploreSort.ratingHigh => 'Top rated',
    _ExploreSort.priceLow => 'Price: low to high',
  };
}

class _CompactFilterButton extends StatelessWidget {
  const _CompactFilterButton({
    required this.icon,
    required this.label,
    required this.onTap,
    this.isActive = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool isActive;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Material(
      color: isActive ? scheme.primaryContainer : scheme.surfaceContainerHighest,
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 16,
                color: isActive ? scheme.onPrimaryContainer : scheme.onSurface,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: isActive ? scheme.onPrimaryContainer : scheme.onSurface,
                    ),
              ),
              const SizedBox(width: 4),
              Icon(
                Icons.keyboard_arrow_down_rounded,
                size: 18,
                color: isActive ? scheme.onPrimaryContainer : scheme.onSurfaceVariant,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SingleSelectSheet<T> extends StatelessWidget {
  const _SingleSelectSheet({
    required this.title,
    required this.selected,
    required this.options,
    required this.labelBuilder,
  });

  final String title;
  final T selected;
  final List<T> options;
  final String Function(T value) labelBuilder;

  @override
  Widget build(BuildContext context) {
    final maxHeight = MediaQuery.sizeOf(context).height * 0.75;
    return ConstrainedBox(
      constraints: BoxConstraints(maxHeight: maxHeight),
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
              ),
              const SizedBox(height: 8),
              for (final option in options)
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(labelBuilder(option)),
                  trailing: option == selected
                      ? const Icon(Icons.check_rounded, color: AppTokens.brandPrimary)
                      : null,
                  onTap: () => Navigator.of(context).pop(option),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActiveTag extends StatelessWidget {
  const _ActiveTag({required this.text, required this.onRemove});

  final String text;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(999),
      onTap: onRemove,
      child: Container(
        padding: const EdgeInsets.fromLTRB(8, 4, 6, 4),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(999),
          color: Theme.of(context).colorScheme.primaryContainer,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              text,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
            const SizedBox(width: 4),
            const Icon(Icons.close_rounded, size: 14),
          ],
        ),
      ),
    );
  }
}

class _ExploreStickyFiltersDelegate extends SliverPersistentHeaderDelegate {
  _ExploreStickyFiltersDelegate({
    required this.minExtentHeight,
    required this.maxExtentHeight,
    required this.child,
  });

  final double minExtentHeight;
  final double maxExtentHeight;
  final Widget child;

  @override
  double get minExtent => minExtentHeight;

  @override
  double get maxExtent => maxExtentHeight;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return child;
  }

  @override
  bool shouldRebuild(covariant _ExploreStickyFiltersDelegate oldDelegate) {
    return oldDelegate.child != child ||
        oldDelegate.minExtentHeight != minExtentHeight ||
        oldDelegate.maxExtentHeight != maxExtentHeight;
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
                            child: AnimatedScale(
                              duration: const Duration(milliseconds: 180),
                              curve: Curves.easeOut,
                              scale: isSaved ? 1.12 : 1,
                              child: Icon(
                                isSaved
                                    ? Icons.favorite_rounded
                                    : Icons.favorite_border_rounded,
                                size: 18,
                                color: isSaved ? AppTokens.brandAccent : Colors.white,
                              ),
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

class _ExploreResultSkeletonCard extends StatelessWidget {
  const _ExploreResultSkeletonCard();

  @override
  Widget build(BuildContext context) {
    final base = Theme.of(context).colorScheme.surfaceContainerHighest;
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        color: Theme.of(context).colorScheme.surface,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 180,
            decoration: BoxDecoration(
              color: base,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(height: 16, width: 220, color: base),
                const SizedBox(height: 8),
                Container(height: 12, width: 150, color: base),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Container(height: 24, width: 110, color: base),
                    const Spacer(),
                    Container(height: 16, width: 80, color: base),
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
