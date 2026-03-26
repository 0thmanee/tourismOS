import 'package:flutter/material.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/widgets/catalog_image.dart';
import '../../../../core/widgets/catalog_operator_row.dart';

/// Home / list card spec: image, title, city, duration, host + optional verified, price.
class ExperienceCard extends StatelessWidget {
  const ExperienceCard({
    super.key,
    required this.title,
    required this.city,
    required this.duration,
    required this.priceFromMad,
    this.imageRef,
    this.operatorName,
    this.operatorLogoRef,
    this.category = 'Experiences',
    this.isSaved = false,
    this.verified = false,
    this.rating,
    this.onToggleSaved,
    this.onTap,
  });

  final String title;
  final String city;
  final String duration;
  final int priceFromMad;

  /// Asset path (e.g. `assets/...`) or `http(s)` URL from the API.
  final String? imageRef;
  /// Listing operator / business display name from catalog.
  final String? operatorName;
  /// Operator logo URL or asset path; optional — falls back to initial letter.
  final String? operatorLogoRef;
  final String category;
  final bool isSaved;
  final bool verified;
  final double? rating;
  final VoidCallback? onToggleSaved;
  final VoidCallback? onTap;

  Color _categoryChipColor(String value) {
    switch (value.trim().toLowerCase()) {
      case 'adventure':
        return const Color(0xFFEF6C00);
      case 'desert':
        return const Color(0xFF8D6E63);
      case 'food':
        return const Color(0xFF2E7D32);
      case 'culture':
        return const Color(0xFF6A1B9A);
      case 'nature':
        return const Color(0xFF00897B);
      default:
        return AppTokens.brandPrimary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final host = operatorName?.trim() ?? '';
    final showHost = host.isNotEmpty;
    final showVerifiedPill = verified && !showHost;
    final ratingLabel = rating ?? 4.6;
    final bodySpacing = showHost ? MainAxisAlignment.spaceEvenly : MainAxisAlignment.spaceAround;

    return Card(
      clipBehavior: Clip.antiAlias,
      margin: EdgeInsets.zero,
      child: InkWell(
        onTap: onTap,
        child: SizedBox(
          width: 260,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AspectRatio(
                aspectRatio: 16 / 9,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    CatalogImage(
                      ref: imageRef,
                      fit: BoxFit.cover,
                      alignment: Alignment.topCenter,
                      errorColor: theme.colorScheme.surfaceContainerHigh,
                    ),
                    Positioned(
                      left: 10,
                      top: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _categoryChipColor(category).withValues(alpha: 0.92),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          category,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      right: 10,
                      top: 10,
                      child: Material(
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
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: bodySpacing,
                    children: [
                      Text(
                        title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '$city • $duration',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                      if (showHost) ...[
                        CatalogOperatorRow(
                          name: host,
                          imageRef: operatorLogoRef,
                          verified: verified,
                          avatarSize: 24,
                          iconSize: 16,
                        ),
                      ],
                      Row(
                        children: [
                          if (showVerifiedPill)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: AppTokens.success.withValues(alpha: 0.16),
                                borderRadius: BorderRadius.circular(999),
                                border: Border.all(
                                  color: AppTokens.success.withValues(alpha: 0.35),
                                ),
                              ),
                              child: Text(
                                'Verified',
                                style: theme.textTheme.labelSmall?.copyWith(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          if (showVerifiedPill) const SizedBox(width: 8),
                          Icon(
                            Icons.star_rounded,
                            size: 18,
                            color: AppTokens.brandAccent,
                          ),
                          const SizedBox(width: 3),
                          Text(
                            ratingLabel.toStringAsFixed(1),
                            style: theme.textTheme.labelLarge?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const Spacer(),
                          Text(
                            'From $priceFromMad MAD',
                            style: theme.textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w900,
                            ),
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
      ),
    );
  }
}
