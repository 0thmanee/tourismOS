import 'package:flutter/material.dart';
import '../../../../core/theme/app_tokens.dart';

/// Home / list card spec: image, title, city, duration, price from, optional verified.
class ExperienceCard extends StatelessWidget {
  const ExperienceCard({
    super.key,
    required this.title,
    required this.city,
    required this.duration,
    required this.priceFromMad,
    this.verified = false,
    this.rating,
    this.onTap,
  });

  final String title;
  final String city;
  final String duration;
  final int priceFromMad;
  final bool verified;
  final double? rating;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: SizedBox(
          width: 260,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AspectRatio(
                aspectRatio: 16 / 10,
                child: Container(
                  color: AppTokens.brandPrimary.withValues(
                    alpha: 0.35,
                  ),
                  child: Icon(
                    Icons.image_outlined,
                    size: 40,
                    color: AppTokens.brandAccent,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 10, 12, 4),
                child: Text(
                  title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Text(
                  '$city • $duration',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 8, 12, 10),
                child: Row(
                  children: [
                    Text(
                      'From $priceFromMad MAD',
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    if (rating != null) ...[
                      const SizedBox(width: 8),
                      Icon(
                        Icons.star_rounded,
                        size: 18,
                        color: AppTokens.brandAccent,
                      ),
                      Text(
                        rating!.toStringAsFixed(1),
                        style: theme.textTheme.labelLarge,
                      ),
                    ],
                    const Spacer(),
                    if (verified)
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
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
