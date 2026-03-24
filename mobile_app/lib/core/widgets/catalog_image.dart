import 'package:flutter/material.dart';

import '../theme/app_tokens.dart';

/// Renders a catalog image from either a `package:` / `assets/` path or an `http(s)` URL.
class CatalogImage extends StatelessWidget {
  const CatalogImage({
    super.key,
    required this.ref,
    this.fit = BoxFit.cover,
    this.alignment = Alignment.center,
    this.errorColor,
  });

  final String? ref;
  final BoxFit fit;
  final Alignment alignment;
  final Color? errorColor;

  static bool isNetwork(String? r) {
    if (r == null || r.isEmpty) return false;
    return r.startsWith('http://') || r.startsWith('https://');
  }

  @override
  Widget build(BuildContext context) {
    final r = ref;
    if (r == null || r.isEmpty) {
      return ColoredBox(
        color: errorColor ?? AppTokens.forestMid,
        child: const Center(
          child: Icon(Icons.image_outlined, color: AppTokens.brandAccent, size: 40),
        ),
      );
    }
    if (isNetwork(r)) {
      return Image.network(
        r,
        fit: fit,
        alignment: alignment,
        errorBuilder: (_, __, ___) => ColoredBox(
          color: errorColor ?? Theme.of(context).colorScheme.surfaceContainerHigh,
        ),
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return ColoredBox(
            color: Theme.of(context).colorScheme.surfaceContainerHighest,
            child: const Center(
              child: SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            ),
          );
        },
      );
    }
    return Image.asset(
      r,
      fit: fit,
      alignment: alignment,
      errorBuilder: (_, __, ___) => ColoredBox(
        color: errorColor ?? Theme.of(context).colorScheme.surfaceContainerHigh,
      ),
    );
  }
}
