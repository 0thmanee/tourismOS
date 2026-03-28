import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/config/app_env.dart';
import '../../../core/data/app_mock_data.dart';
import '../../../core/theme/app_tokens.dart';
import '../../../core/widgets/app_main_app_bar.dart';
import '../../../core/widgets/catalog_image.dart';
import '../../../core/widgets/catalog_operator_row.dart';
import '../../experiences/domain/experience.dart';
import '../../experiences/state/catalog_providers.dart';
import '../../favorites/state/favorites_store.dart';

enum _ExploreSort { recommended, priceLow, ratingHigh }
enum _PriceRange { any, under300, between300600, between6001000, over1000 }

class ExploreScreen extends ConsumerStatefulWidget {
  const ExploreScreen({super.key});

  @override
  ConsumerState<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends ConsumerState<ExploreScreen> {
  final TextEditingController _searchCtrl = TextEditingController();
  final Set<String> _activeCategories = {};
  String _activeCity = 'All';
  bool _initialCityApplied = false;
  _ExploreSort _sort = _ExploreSort.recommended;
  _PriceRange _priceRange = _PriceRange.any;
  bool _isInitialLoading = true;
  @override
  void initState() {
    super.initState();
    if (!AppEnv.useRemoteCatalog) {
      Future<void>.delayed(const Duration(milliseconds: 700), () {
        if (!mounted) return;
        setState(() => _isInitialLoading = false);
      });
    } else {
      _isInitialLoading = false;
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_initialCityApplied) {
      _initialCityApplied = true;
      final requestedCity = GoRouterState.of(context).uri.queryParameters['city'];
      if (requestedCity != null && requestedCity.trim().isNotEmpty) {
        _activeCity = requestedCity.trim();
      }
    }

    final catalog = ref.watch(marketplaceCatalogProvider);
    final all = catalog.maybeWhen(
      data: (s) => s.items,
      orElse: () => <Experience>[],
    );
    final filtered = _applyFilters(all);
    final savedIds = ref.watch(favoritesStoreProvider);
    final catalogSnap = catalog.valueOrNull;
    final cities = <String>{
      'All',
      ...?catalogSnap?.availableCities,
      ...all.map((e) => e.city).where((c) => c.trim().isNotEmpty),
    }.toList()
      ..sort((a, b) {
        if (a == 'All') return -1;
        if (b == 'All') return 1;
        return a.compareTo(b);
      });

    final remoteLoading = AppEnv.useRemoteCatalog && catalog.isLoading;
    final showSkeleton = remoteLoading || (!AppEnv.useRemoteCatalog && _isInitialLoading);

    return Scaffold(
          appBar: AppMainAppBar(
            title: const Text('Explore'),
            showBack: false,
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
                                            options: <String>{
                                              'All',
                                              ...AppMockData.exploreFilterCategories,
                                              ...?catalogSnap?.availableCategories,
                                              ...all.map((e) => e.category),
                                            }.toList()
                                              ..sort((a, b) {
                                                if (a == 'All') return -1;
                                                if (b == 'All') return 1;
                                                return a.compareTo(b);
                                              }),
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
                if (AppEnv.useRemoteCatalog && catalog.hasError)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                      child: Material(
                        color: Theme.of(context).colorScheme.errorContainer,
                        borderRadius: BorderRadius.circular(12),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  'Could not refresh the catalog.',
                                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                        fontWeight: FontWeight.w600,
                                      ),
                                ),
                              ),
                              TextButton(
                                onPressed: () =>
                                    ref.invalidate(marketplaceCatalogProvider),
                                child: const Text('Retry'),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                if (showSkeleton)
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
                if (!showSkeleton)
                  SliverList.separated(
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final item = filtered[index];
                    final isSaved = savedIds.contains(item.id);
                    return Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
                      child: _ExploreResultCard(
                        item: item,
                        isSaved: isSaved,
                        onToggleSaved: () {
                          ref
                              .read(favoritesStoreProvider.notifier)
                              .toggle(item.id);
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
  }

  List<Experience> _applyFilters(List<Experience> list) {
    final query = _searchCtrl.text.trim().toLowerCase();
    final filtered = list.where((item) {
      final city = item.city.toLowerCase();
      final title = item.title.toLowerCase();
      final category = item.category;
      final queryPass =
          query.isEmpty || title.contains(query) || city.contains(query) || category.toLowerCase().contains(query);
      final cityPass = _activeCity == 'All' || item.city == _activeCity;
      final categoryPass = _activeCategories.isEmpty || _activeCategories.contains(category);
      final price = item.price.fromMad;
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
        filtered.sort((a, b) => a.price.fromMad.compareTo(b.price.fromMad));
      case _ExploreSort.ratingHigh:
        filtered.sort((a, b) {
          final ra = a.rating.average ?? 0;
          final rb = b.rating.average ?? 0;
          return rb.compareTo(ra);
        });
      case _ExploreSort.recommended:
        filtered.sort((a, b) {
          final av = (a.trust.verifiedOperator ? 1 : 0) +
              ((a.rating.average ?? 4.2) * 10).round();
          final bv = (b.trust.verifiedOperator ? 1 : 0) +
              ((b.rating.average ?? 4.2) * 10).round();
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

  final Experience item;
  final bool isSaved;
  final VoidCallback onToggleSaved;

  @override
  Widget build(BuildContext context) {
    final verified = item.trust.verifiedOperator;
    final host = item.operatorName.trim();
    final showHost = host.isNotEmpty;
    final showVerifiedChip = verified && !showHost;
    final ratingLabel = item.rating.average ?? 4.6;
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => context.go('/app/home/experience/${item.id}'),
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
                  child: CatalogImage(
                    ref: item.media.primaryImageRef,
                    fit: BoxFit.cover,
                    alignment: Alignment.topCenter,
                    errorColor: Theme.of(context).colorScheme.surfaceContainerHigh,
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
                      item.category,
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
                    item.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w900,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${item.city} • ${item.logistics.durationLabel}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                  ),
                  if (showHost) ...[
                    const SizedBox(height: 10),
                    CatalogOperatorRow(
                      name: host,
                      imageRef: item.operatorLogoUrl,
                      verified: verified,
                      avatarSize: 30,
                      iconSize: 20,
                      sectionLabel: 'Hosted by',
                      hostPanel: true,
                    ),
                  ],
                  Padding(
                    padding: const EdgeInsets.only(top: 10, bottom: 4),
                    child: Divider(
                      height: 1,
                      thickness: 1,
                      color: Theme.of(context).colorScheme.outlineVariant.withValues(alpha: 0.45),
                    ),
                  ),
                  Row(
                    children: [
                      if (showVerifiedChip)
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
                      if (showVerifiedChip) const SizedBox(width: 8),
                      Icon(Icons.star_rounded, color: AppTokens.brandAccent, size: 18),
                      const SizedBox(width: 3),
                      Text(
                        ratingLabel.toStringAsFixed(1),
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                      const Spacer(),
                      Text(
                        'From ${item.price.fromMad} MAD',
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w900,
                            ),
                      ),
                    ],
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
                Container(height: 10, width: 72, color: base),
                const SizedBox(height: 6),
                Container(
                  height: 46,
                  decoration: BoxDecoration(
                    color: base,
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                const SizedBox(height: 10),
                Container(height: 1, color: base),
                const SizedBox(height: 8),
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
