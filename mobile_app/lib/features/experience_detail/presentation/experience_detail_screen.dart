import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_tokens.dart';
import '../../../core/widgets/catalog_image.dart';
import '../../experiences/domain/experience.dart';
import '../../experiences/state/catalog_providers.dart';
import '../../favorites/state/favorites_store.dart';

class ExperienceDetailScreen extends ConsumerStatefulWidget {
  const ExperienceDetailScreen({super.key, required this.experienceId});

  final String experienceId;

  @override
  ConsumerState<ExperienceDetailScreen> createState() =>
      _ExperienceDetailScreenState();
}

class _ExperienceDetailScreenState extends ConsumerState<ExperienceDetailScreen> {
  int _galleryIndex = 0;

  @override
  Widget build(BuildContext context) {
    final asyncExp = ref.watch(experienceDetailProvider(widget.experienceId));

    return asyncExp.when(
      loading: () => Scaffold(
        appBar: AppBar(
          title: const Text('Experience'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            tooltip: 'Back',
            onPressed: () {
              if (context.canPop()) {
                context.pop();
              } else {
                context.go('/app/home');
              }
            },
          ),
        ),
        body: const Center(child: CircularProgressIndicator()),
      ),
      error: (_, __) => _DetailStateScaffold(
        title: 'Experience unavailable',
        message:
            'We could not load this experience. Check your connection or try again.',
        primaryLabel: 'Retry',
        onPrimary: () =>
            ref.invalidate(experienceDetailProvider(widget.experienceId)),
        secondaryLabel: 'Back to Explore',
        onSecondary: () => context.go('/app/explore'),
      ),
      data: (detail) {
        final gallery = detail.media.orderedGalleryRefs;
        final hasRequiredContent = detail.title.trim().isNotEmpty && gallery.isNotEmpty;
        if (!hasRequiredContent) {
          return _DetailStateScaffold(
            title: 'Experience unavailable',
            message:
                'We could not load this experience right now. Please go back to Explore and try another one.',
            primaryLabel: 'Back to Explore',
            onPrimary: () => context.go('/app/explore'),
          );
        }
        if (_galleryIndex >= gallery.length) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) setState(() => _galleryIndex = 0);
          });
        }
        return _buildLoaded(context, detail, gallery);
      },
    );
  }

  Widget _buildLoaded(
    BuildContext context,
    Experience detail,
    List<String> gallery,
  ) {
    final idx = _galleryIndex.clamp(0, gallery.length - 1);
    final highlights = detail.content.highlights;
    final includes = detail.content.includes;
    final price = detail.price.fromMad;
    final rating = detail.rating.average;
    final reviewsCount = detail.rating.reviewsCount;
    final verified = detail.trust.verifiedOperator;
    final ctaLabel = _bookingCta(detail);
    final isSaved = ref.watch(favoritesStoreProvider).contains(widget.experienceId);
    final confirmationCopy = detail.trust.confirmationLabel ??
        (detail.uiTreatAsRequestBooking
            ? 'Request-based confirmation'
            : 'Instant confirmation');
    final responseCopy =
        detail.trust.responseTimeLabel ?? 'Details shared after booking';
    final cancellationCopy =
        detail.trust.cancellationLabel ?? 'Per operator policy';

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 320,
            pinned: true,
            stretch: true,
            foregroundColor: Colors.white,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded),
              tooltip: 'Back',
              onPressed: () {
                if (context.canPop()) {
                  context.pop();
                } else {
                  context.go('/app/home');
                }
              },
            ),
            actions: [
              IconButton(
                onPressed: () =>
                    ref.read(favoritesStoreProvider.notifier).toggle(widget.experienceId),
                icon: Icon(
                  isSaved ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                ),
                color: isSaved ? AppTokens.brandAccent : Colors.white,
                tooltip: isSaved ? 'Unsave' : 'Save',
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  CatalogImage(
                    ref: gallery[idx],
                    fit: BoxFit.cover,
                    alignment: Alignment.topCenter,
                    errorColor: AppTokens.forestMid,
                  ),
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withValues(alpha: 0.04),
                          Colors.black.withValues(alpha: 0.55),
                        ],
                      ),
                    ),
                  ),
                  Positioned(
                    left: 16,
                    right: 16,
                    bottom: 16,
                    child: Text(
                      detail.title,
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
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.location_on_rounded, color: AppTokens.text2, size: 18),
                      const SizedBox(width: 4),
                      Text(detail.city),
                      const SizedBox(width: 12),
                      if (rating != null) ...[
                        const Icon(Icons.star_rounded, color: AppTokens.brandAccent),
                        Text(
                          '${rating.toStringAsFixed(1)}'
                          '${reviewsCount != null ? ' ($reviewsCount)' : ''}',
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    detail.summary,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _InfoPill(
                        icon: Icons.schedule_rounded,
                        label: detail.logistics.durationLabel,
                      ),
                      _InfoPill(
                        icon: Icons.people_alt_rounded,
                        label: detail.logistics.groupSizeLabel ?? 'Small group',
                      ),
                      _InfoPill(
                        icon: Icons.translate_rounded,
                        label: detail.logistics.languagesJoined,
                      ),
                      _InfoPill(
                        icon: Icons.policy_rounded,
                        label: cancellationCopy,
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  _HostedBySection(detail: detail),
                  const SizedBox(height: 12),
                  _SectionCard(
                    title: 'Highlights',
                    child: Column(
                      children: highlights.isEmpty
                          ? [
                              Text(
                                'Highlights will appear here when the operator adds them.',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                                    ),
                              ),
                            ]
                          : highlights
                              .map((item) => _BulletLine(text: item, icon: Icons.check_circle))
                              .toList(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  _SectionCard(
                    title: "What's included",
                    child: Column(
                      children: includes.isEmpty
                          ? [
                              Text(
                                'Inclusions will appear here when the operator adds them.',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                                    ),
                              ),
                            ]
                          : includes
                              .map(
                                (item) => _BulletLine(
                                  text: item,
                                  icon: Icons.add_task_rounded,
                                ),
                              )
                              .toList(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  _SectionCard(
                    title: 'Meeting point',
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          detail.logistics.meetingPoint.isNotEmpty
                              ? detail.logistics.meetingPoint
                              : 'The operator will confirm the meeting point after booking.',
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          detail.logistics.meetingNote ??
                              'Exact instructions are shared after booking confirmation.',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Theme.of(context).colorScheme.onSurfaceVariant,
                              ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  _SectionCard(
                    title: 'Trust and policy',
                    child: Column(
                      children: [
                        _BulletLine(
                          text: verified
                              ? 'Verified operator profile'
                              : 'Trusted operator profile',
                          icon: Icons.workspace_premium_rounded,
                        ),
                        _BulletLine(
                          text: confirmationCopy,
                          icon: Icons.flash_on_rounded,
                        ),
                        _BulletLine(
                          text: responseCopy,
                          icon: Icons.bolt_rounded,
                        ),
                        _BulletLine(
                          text: cancellationCopy,
                          icon: Icons.policy_rounded,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  _InteractiveGallery(
                    images: gallery,
                    selectedIndex: idx,
                    onSelected: (value) => setState(() => _galleryIndex = value),
                  ),
                  const SizedBox(height: 94),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomSheet: SafeArea(
        top: false,
        child: Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            border: Border(
              top: BorderSide(
                color: Theme.of(context).colorScheme.outlineVariant.withValues(alpha: 0.8),
              ),
            ),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'From $price MAD',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    Text(
                      detail.price.pricingLabel,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: FilledButton(
                  onPressed: () =>
                      context.go('/app/home/experience/${widget.experienceId}/book'),
                  child: Text(ctaLabel),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _HostedBySection extends StatelessWidget {
  const _HostedBySection({required this.detail});

  final Experience detail;

  @override
  Widget build(BuildContext context) {
    final logoRef = detail.operatorLogoUrl.trim().isNotEmpty
        ? detail.operatorLogoUrl
        : detail.media.primaryImageRef;
    final cityLine = detail.city.trim().isEmpty
        ? 'Local operator'
        : 'Local operator in ${detail.city}';
    final canProfile = detail.organizationId.trim().isNotEmpty;
    final verified = detail.trust.verifiedOperator;

    return _SectionCard(
      title: 'Hosted by',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _HostedByAvatar(ref: logoRef, name: detail.operatorName),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      detail.operatorName,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      cityLine,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                    if (verified) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(
                            Icons.verified_rounded,
                            size: 18,
                            color: AppTokens.forestMid,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Verified operator',
                            style: Theme.of(context).textTheme.labelLarge?.copyWith(
                                  color: AppTokens.forestMid,
                                  fontWeight: FontWeight.w800,
                                ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          if (canProfile) ...[
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () => context.push(
                  '/app/home/provider/${detail.organizationId}',
                ),
                child: const Text('View profile'),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _HostedByAvatar extends StatelessWidget {
  const _HostedByAvatar({required this.ref, required this.name});

  final String ref;
  final String name;

  @override
  Widget build(BuildContext context) {
    final trimmed = name.trim();
    final initial = trimmed.isNotEmpty ? trimmed[0].toUpperCase() : '?';
    return ClipOval(
      child: ref.trim().isEmpty
          ? CircleAvatar(
              radius: 28,
              backgroundColor:
                  Theme.of(context).colorScheme.surfaceContainerHighest,
              child: Text(
                initial,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
              ),
            )
          : SizedBox(
              width: 56,
              height: 56,
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

class _DetailStateScaffold extends StatelessWidget {
  const _DetailStateScaffold({
    required this.title,
    required this.message,
    required this.primaryLabel,
    required this.onPrimary,
    this.secondaryLabel,
    this.onSecondary,
  });

  final String title;
  final String message;
  final String primaryLabel;
  final VoidCallback onPrimary;
  final String? secondaryLabel;
  final VoidCallback? onSecondary;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Experience'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          tooltip: 'Back',
          onPressed: onSecondary ?? onPrimary,
        ),
      ),
      body: Center(
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
                FilledButton(
                  onPressed: onPrimary,
                  child: Text(primaryLabel),
                ),
                if (secondaryLabel != null && onSecondary != null) ...[
                  const SizedBox(height: 8),
                  TextButton(
                    onPressed: onSecondary,
                    child: Text(secondaryLabel!),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _InteractiveGallery extends StatelessWidget {
  const _InteractiveGallery({
    required this.images,
    required this.selectedIndex,
    required this.onSelected,
  });

  final List<String> images;
  final int selectedIndex;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Gallery',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w900,
              ),
        ),
        const SizedBox(height: 10),
        InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => _openViewer(context),
          child: Stack(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: SizedBox(
                  height: 190,
                  width: double.infinity,
                  child: CatalogImage(
                    ref: images[selectedIndex],
                    fit: BoxFit.cover,
                    alignment: Alignment.topCenter,
                    errorColor: AppTokens.creamDark,
                  ),
                ),
              ),
              Positioned(
                right: 10,
                bottom: 10,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.55),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    '${selectedIndex + 1}/${images.length}',
                    style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 84,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: images.length,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (context, i) {
              final selected = i == selectedIndex;
              return InkWell(
                onTap: () => onSelected(i),
                borderRadius: BorderRadius.circular(12),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  width: 120,
                  padding: EdgeInsets.all(selected ? 2 : 0),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: selected
                        ? Border.all(color: AppTokens.brandAccent, width: 1.5)
                        : null,
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: CatalogImage(
                      ref: images[i],
                      fit: BoxFit.cover,
                      alignment: Alignment.topCenter,
                      errorColor: AppTokens.creamDark,
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Future<void> _openViewer(BuildContext context) async {
    final pageController = PageController(initialPage: selectedIndex);
    var current = selectedIndex;
    await showDialog<void>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return Dialog.fullscreen(
              child: Stack(
                children: [
                  PageView.builder(
                    controller: pageController,
                    itemCount: images.length,
                    onPageChanged: (value) => setDialogState(() => current = value),
                    itemBuilder: (context, i) => InteractiveViewer(
                      minScale: 1,
                      maxScale: 4,
                      child: Center(
                        child: CatalogImage(
                          ref: images[i],
                          fit: BoxFit.contain,
                          alignment: Alignment.center,
                          errorColor: Colors.black,
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    top: 44,
                    right: 16,
                    child: IconButton.filledTonal(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.close_rounded),
                    ),
                  ),
                  Positioned(
                    top: 50,
                    left: 18,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.45),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        '${current + 1}/${images.length}',
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
    onSelected(current);
  }
}

String _bookingCta(Experience e) {
  if (e.uiTreatAsRequestBooking) {
    return e.kind == 'MULTI_DAY' ? 'Check availability' : 'Request booking';
  }
  switch (e.kind) {
    case 'FIXED_SLOT':
    case 'RESOURCE_BASED':
      return 'Book now';
    case 'MULTI_DAY':
      return 'Check availability';
    default:
      return 'Book now';
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Theme.of(context).colorScheme.outlineVariant.withValues(alpha: 0.65),
        ),
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
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }
}

class _InfoPill extends StatelessWidget {
  const _InfoPill({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: AppTokens.creamDark,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: AppTokens.brandPrimary),
          const SizedBox(width: 6),
          Text(
            label,
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
          ),
        ],
      ),
    );
  }
}

class _BulletLine extends StatelessWidget {
  const _BulletLine({required this.text, required this.icon});

  final String text;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 17, color: AppTokens.brandPrimary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}
