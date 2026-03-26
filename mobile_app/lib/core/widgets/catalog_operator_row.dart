import 'package:flutter/material.dart';

import '../theme/app_tokens.dart';
import 'catalog_image.dart';

/// Host line for catalog cards: optional section label, circular logo (or initial), name, verified.
class CatalogOperatorRow extends StatelessWidget {
  const CatalogOperatorRow({
    super.key,
    required this.name,
    this.imageRef,
    this.verified = false,
    this.avatarSize = 28,
    this.iconSize = 18,
    this.sectionLabel,
    this.hostPanel = false,
  });

  final String name;
  final String? imageRef;
  final bool verified;
  final double avatarSize;
  final double iconSize;
  /// e.g. `Hosted by` — groups the host block from title / logistics.
  final String? sectionLabel;
  /// Light inset panel (stronger grouping on vertical list cards).
  final bool hostPanel;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final trimmed = name.trim();
    if (trimmed.isEmpty) return const SizedBox.shrink();

    final initial = trimmed.isNotEmpty ? trimmed[0].toUpperCase() : '?';
    final ref = imageRef?.trim() ?? '';
    final hasImage = ref.isNotEmpty;

    final row = Row(
      children: [
        Container(
          width: avatarSize,
          height: avatarSize,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: theme.colorScheme.outlineVariant.withValues(alpha: 0.6),
            ),
          ),
          clipBehavior: Clip.antiAlias,
          child: hasImage
              ? CatalogImage(
                  ref: ref,
                  fit: BoxFit.cover,
                  errorColor: theme.colorScheme.surfaceContainerHighest,
                )
              : ColoredBox(
                  color: theme.colorScheme.surfaceContainerHighest,
                  child: Center(
                    child: Text(
                      initial,
                      style: theme.textTheme.labelLarge?.copyWith(
                        fontWeight: FontWeight.w900,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                ),
        ),
        SizedBox(width: avatarSize >= 26 ? 8 : 6),
        Expanded(
          child: Text(
            trimmed,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.labelMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ),
        if (verified) ...[
          SizedBox(width: avatarSize >= 26 ? 6 : 4),
          Icon(
            Icons.verified_rounded,
            size: iconSize,
            color: AppTokens.forestMid,
          ),
        ],
      ],
    );

    Widget body = row;
    if (hostPanel) {
      body = DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.72),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          child: row,
        ),
      );
    }

    final label = sectionLabel?.trim();
    if (label == null || label.isEmpty) {
      return body;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: theme.textTheme.labelSmall?.copyWith(
            fontWeight: FontWeight.w800,
            letterSpacing: 0.35,
            color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.85),
          ),
        ),
        SizedBox(height: hostPanel ? 6 : 4),
        body,
      ],
    );
  }
}
