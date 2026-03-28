import 'package:flutter/material.dart';

/// Brand mark for splash, onboarding, and auth flows only.
class AppBrandLogo extends StatelessWidget {
  const AppBrandLogo({
    super.key,
    this.height = 32,
    this.semanticLabel = 'App logo',
  });

  static const assetPath = 'assets/logo.png';

  final double height;
  final String semanticLabel;

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).colorScheme.primary;
    return SizedBox(
      height: height,
      child: Image.asset(
        assetPath,
        height: height,
        fit: BoxFit.contain,
        semanticLabel: semanticLabel,
        errorBuilder: (_, __, ___) => Icon(
          Icons.explore_rounded,
          size: height * 0.85,
          color: primary,
        ),
      ),
    );
  }
}
