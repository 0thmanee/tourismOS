import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_tokens.dart';
import '../../../core/widgets/catalog_image.dart';
import '../../experiences/domain/experience.dart';
import '../../experiences/state/catalog_providers.dart';

/// Lean host identity: no reviews — catalog slice for this [organizationId] only.
class ProviderProfileScreen extends ConsumerWidget {
  const ProviderProfileScreen({super.key, required this.organizationId});

  final String organizationId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncCatalog = ref.watch(marketplaceCatalogProvider);

    return asyncCatalog.when(
      loading: () => Scaffold(
        appBar: AppBar(title: const Text('Host')),
        body: const Center(child: CircularProgressIndicator()),
      ),
      error: (_, __) => Scaffold(
        appBar: AppBar(title: const Text('Host')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Could not load catalog.',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: () => ref.invalidate(marketplaceCatalogProvider),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      ),
      data: (state) {
        final items = state.items
            .where((e) => e.organizationId == organizationId)
            .toList();
        if (items.isEmpty) {
          return Scaffold(
            appBar: AppBar(
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                onPressed: () {
                  if (context.canPop()) {
                    context.pop();
                  } else {
                    context.go('/app/explore');
                  }
                },
              ),
              title: const Text('Host'),
            ),
            body: Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  'No experiences found for this host.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
              ),
            ),
          );
        }
        return _ProviderProfileBody(experiences: items);
      },
    );
  }
}

class _ProviderProfileBody extends StatelessWidget {
  const _ProviderProfileBody({required this.experiences});

  final List<Experience> experiences;

  @override
  Widget build(BuildContext context) {
    final primary = experiences.first;
    final name = primary.operatorName;
    final logoRef = primary.operatorLogoUrl.trim().isNotEmpty
        ? primary.operatorLogoUrl
        : primary.media.primaryImageRef;
    final bio = primary.operatorBio;
    final verified =
        experiences.any((e) => e.trust.verifiedOperator);
    final cities = experiences.map((e) => e.city).where((c) => c.isNotEmpty).toSet().toList()
      ..sort();

    return Scaffold(
      appBar: AppBar(
        title: Text(name),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/app/explore');
            }
          },
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _HostAvatar(ref: logoRef, name: name),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    const SizedBox(height: 6),
                    if (verified)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(999),
                          color: AppTokens.forestMid.withValues(alpha: 0.12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.verified_rounded,
                              size: 16,
                              color: AppTokens.forestMid,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Verified operator',
                              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                                    color: AppTokens.forestMid,
                                    fontWeight: FontWeight.w800,
                                  ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
          if (cities.isNotEmpty) ...[
            const SizedBox(height: 14),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.place_outlined, size: 20, color: AppTokens.text2),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    cities.length == 1
                        ? cities.first
                        : cities.join(' · '),
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 16),
          Text(
            bio ??
                'Local operator on Morocco Experiences. Book through the app for clear confirmation and support.',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                  height: 1.35,
                ),
          ),
          const SizedBox(height: 20),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              color: Theme.of(context).colorScheme.surfaceContainerHighest,
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  Icons.support_agent_rounded,
                  size: 22,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Contact happens through bookings — we coordinate with your host so expectations stay clear.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Their experiences',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
          ),
          const SizedBox(height: 10),
          ...experiences.map((e) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _ExperienceRowCard(experience: e),
              )),
        ],
      ),
    );
  }
}

class _HostAvatar extends StatelessWidget {
  const _HostAvatar({required this.ref, required this.name});

  final String ref;
  final String name;

  @override
  Widget build(BuildContext context) {
    final initial = name.isNotEmpty ? name[0].toUpperCase() : '?';
    return ClipOval(
      child: ref.trim().isEmpty
          ? CircleAvatar(
              radius: 40,
              backgroundColor:
                  Theme.of(context).colorScheme.surfaceContainerHighest,
              child: Text(
                initial,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
              ),
            )
          : SizedBox(
              width: 80,
              height: 80,
              child: CatalogImage(
                ref: ref,
                fit: BoxFit.cover,
                errorColor:
                    Theme.of(context).colorScheme.surfaceContainerHighest,
              ),
            ),
    );
  }
}

class _ExperienceRowCard extends StatelessWidget {
  const _ExperienceRowCard({required this.experience});

  final Experience experience;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Theme.of(context).colorScheme.surface,
      borderRadius: BorderRadius.circular(16),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () =>
            context.go('/app/home/experience/${experience.id}'),
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Theme.of(context).colorScheme.outlineVariant,
            ),
          ),
          child: Row(
            children: [
              SizedBox(
                width: 96,
                height: 88,
                child: CatalogImage(
                  ref: experience.media.primaryImageRef,
                  fit: BoxFit.cover,
                  errorColor:
                      Theme.of(context).colorScheme.surfaceContainerHigh,
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        experience.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        experience.city,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Theme.of(context)
                                  .colorScheme
                                  .onSurfaceVariant,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'From ${experience.price.fromMad} MAD',
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                              fontWeight: FontWeight.w700,
                              color: AppTokens.forestMid,
                            ),
                      ),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(right: 8),
                child: Icon(
                  Icons.chevron_right_rounded,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
