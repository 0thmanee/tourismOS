import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/config/app_env.dart';
import '../../../core/data/app_mock_data.dart';
import '../../../core/theme/app_tokens.dart';
import '../../../core/widgets/app_main_app_bar.dart';
import '../../../core/widgets/catalog_image.dart';
import '../../../core/widgets/catalog_operator_row.dart';
import '../../experiences/data/experience_mock_mapper.dart';
import '../../experiences/domain/experience.dart';
import '../../experiences/state/catalog_providers.dart';
import '../../favorites/state/favorites_store.dart';
import '../../home/data/home_feed_mock.dart';

class FavoritesScreen extends ConsumerStatefulWidget {
  const FavoritesScreen({super.key});

  @override
  ConsumerState<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends ConsumerState<FavoritesScreen> {
  bool _mockSplashDelayDone = false;

  @override
  void initState() {
    super.initState();
    if (!AppEnv.useRemoteCatalog) {
      Future<void>.delayed(const Duration(milliseconds: 550), () {
        if (!mounted) return;
        setState(() => _mockSplashDelayDone = true);
      });
    } else {
      _mockSplashDelayDone = true;
    }
  }

  List<Experience> _resolveSaved(Iterable<String> savedIds) {
    final catalogItems =
        ref.watch(marketplaceCatalogProvider).valueOrNull?.items ?? [];
    final catalogById = {for (final e in catalogItems) e.id: e};
    final mockRows = _allExploreItemMaps();
    final mockById = {for (final m in mockRows) m['id'] as String: m};

    final out = <Experience>[];
    for (final id in savedIds) {
      final fromCat = catalogById[id];
      if (fromCat != null) {
        out.add(fromCat);
        continue;
      }
      final m = mockById[id];
      if (m != null) {
        out.add(
          experienceFromExploreRow(
            {
              'id': m['id'],
              'title': m['title'],
              'city': m['city'],
              'duration': m['duration'],
              'priceFromMad': m['priceFromMad'],
              'rating': m['rating'],
              'verified': m['verified'],
              'image': m['image'],
            },
            categoryOverride: AppMockData.exploreCategoryByExperienceId[id],
          ),
        );
      }
    }
    return out;
  }

  @override
  Widget build(BuildContext context) {
    final savedIds = ref.watch(favoritesStoreProvider);
    final catalogLoading =
        AppEnv.useRemoteCatalog && ref.watch(marketplaceCatalogProvider).isLoading;
    final showSkeleton = catalogLoading || (!_mockSplashDelayDone);

    final saved = _resolveSaved(savedIds);

    return Scaffold(
      appBar: AppMainAppBar(
        title: const Text('Saved experiences'),
      ),
      body: SafeArea(
        child: showSkeleton
            ? const _FavoritesLoadingView()
            : ListView(
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
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              FilledButton.tonal(
                                onPressed: () => context.go('/app/explore'),
                                child: const Text('Browse Explore'),
                              ),
                              if (AppEnv.useRemoteCatalog)
                                OutlinedButton(
                                  onPressed: () =>
                                      ref.invalidate(marketplaceCatalogProvider),
                                  child: const Text('Refresh catalog'),
                                ),
                            ],
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

class _FavoritesLoadingView extends StatelessWidget {
  const _FavoritesLoadingView();

  @override
  Widget build(BuildContext context) {
    final base = Theme.of(context).colorScheme.surfaceContainerHighest;
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
      children: [
        Container(height: 30, width: 220, color: base),
        const SizedBox(height: 8),
        Container(height: 14, width: 300, color: base),
        const SizedBox(height: 14),
        Container(height: 108, color: base),
        const SizedBox(height: 10),
        Container(height: 108, color: base),
        const SizedBox(height: 10),
        Container(height: 108, color: base),
      ],
    );
  }
}

class _SavedCard extends ConsumerWidget {
  const _SavedCard({required this.item});

  final Experience item;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final rating = item.rating.average ?? 4.6;
    final host = item.operatorName.trim();
    final showHost = host.isNotEmpty;
    final verified = item.trust.verifiedOperator;
    return InkWell(
      onTap: () => context.go('/app/home/experience/${item.id}'),
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
              child: CatalogImage(
                ref: item.media.primaryImageRef,
                fit: BoxFit.cover,
                alignment: Alignment.topCenter,
                errorColor: Theme.of(context).colorScheme.surfaceContainerHigh,
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text('${item.city} • ${item.logistics.durationLabel}'),
                    if (showHost) ...[
                      const SizedBox(height: 4),
                      CatalogOperatorRow(
                        name: host,
                        imageRef: item.operatorLogoUrl,
                        verified: verified,
                        avatarSize: 24,
                        iconSize: 17,
                        sectionLabel: 'Hosted by',
                      ),
                    ],
                    const Spacer(),
                    Row(
                      children: [
                        Icon(Icons.star_rounded, color: AppTokens.brandAccent, size: 18),
                        Text(rating.toStringAsFixed(1)),
                        const Spacer(),
                        IconButton(
                          onPressed: () => ref
                              .read(favoritesStoreProvider.notifier)
                              .toggle(item.id),
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

List<Map<String, dynamic>> _allExploreItemMaps() {
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
      'verified': raw['verified'],
      'priceFromMad': raw['priceFromMad'],
    });
  }
  return result;
}
