import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_tokens.dart';
import '../data/experience_detail_mock.dart';

class ExperienceDetailScreen extends StatefulWidget {
  const ExperienceDetailScreen({super.key, required this.experienceId});

  final String experienceId;

  @override
  State<ExperienceDetailScreen> createState() => _ExperienceDetailScreenState();
}

class _ExperienceDetailScreenState extends State<ExperienceDetailScreen> {
  int _galleryIndex = 0;

  @override
  Widget build(BuildContext context) {
    final detail = ExperienceDetailMock.get(widget.experienceId);
    final gallery = (detail['gallery'] as List<dynamic>).cast<String>();
    final highlights = (detail['highlights'] as List<dynamic>).cast<String>();
    final includes = (detail['includes'] as List<dynamic>).cast<String>();
    final price = detail['priceFromMad'] as int;
    final rating = (detail['rating'] as num?)?.toDouble();
    final verified = detail['verified'] == true;
    final activityType = (detail['activityType'] as String?) ?? 'FIXED_SLOT';
    final bookingMode = (detail['bookingMode'] as String?) ?? 'INSTANT';
    final ctaLabel = _bookingCta(activityType, bookingMode);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 320,
            pinned: true,
            stretch: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.asset(
                    gallery[_galleryIndex],
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
                      detail['title'] as String,
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
                      Text(detail['city'] as String),
                      const SizedBox(width: 12),
                      if (rating != null) ...[
                        const Icon(Icons.star_rounded, color: AppTokens.brandAccent),
                        Text('${rating.toStringAsFixed(1)} (${detail['reviewsCount']})'),
                      ],
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    detail['summary'] as String? ?? '',
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
                        label: detail['duration'] as String,
                      ),
                      _InfoPill(
                        icon: Icons.people_alt_rounded,
                        label: detail['groupSize'] as String? ?? 'Small group',
                      ),
                      _InfoPill(
                        icon: Icons.translate_rounded,
                        label: detail['languages'] as String? ?? 'EN',
                      ),
                      _InfoPill(
                        icon: Icons.policy_rounded,
                        label: detail['cancellation'] as String,
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  _SectionCard(
                    title: 'Highlights',
                    child: Column(
                      children: highlights
                          .map((item) => _BulletLine(text: item, icon: Icons.check_circle))
                          .toList(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  _SectionCard(
                    title: 'What\'s included',
                    child: Column(
                      children: includes
                          .map((item) => _BulletLine(text: item, icon: Icons.add_task_rounded))
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
                          detail['meetingPoint'] as String,
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          detail['meetingNote'] as String? ??
                              'Exact instructions are shared after booking.',
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
                          text: verified ? 'Verified operator profile' : 'Trusted operator profile',
                          icon: Icons.workspace_premium_rounded,
                        ),
                        _BulletLine(
                          text: bookingMode == 'REQUEST'
                              ? 'Request-based confirmation'
                              : 'Instant confirmation',
                          icon: Icons.flash_on_rounded,
                        ),
                        _BulletLine(
                          text: detail['responseTime'] as String,
                          icon: Icons.bolt_rounded,
                        ),
                        _BulletLine(
                          text: detail['cancellation'] as String,
                          icon: Icons.policy_rounded,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  _InteractiveGallery(
                    images: gallery,
                    selectedIndex: _galleryIndex,
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
                      'per person',
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
                  child: Image.asset(
                    images[selectedIndex],
                    fit: BoxFit.cover,
                    alignment: Alignment.topCenter,
                    errorBuilder: (_, __, ___) => Container(color: AppTokens.creamDark),
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
                    child: Image.asset(
                      images[i],
                      fit: BoxFit.cover,
                      alignment: Alignment.topCenter,
                      errorBuilder: (_, __, ___) =>
                          Container(color: AppTokens.creamDark),
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
                        child: Image.asset(images[i], fit: BoxFit.contain),
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

String _bookingCta(String activityType, String bookingMode) {
  if (bookingMode == 'REQUEST') {
    return activityType == 'MULTI_DAY' ? 'Check availability' : 'Request booking';
  }
  switch (activityType) {
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
