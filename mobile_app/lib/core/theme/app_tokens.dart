import 'package:flutter/material.dart';

/// Mirrors the web app's `theme.css` semantic tokens.
class AppTokens {
  // Core palette
  static const forestDark = Color(0xFF0D2A2A);
  static const forestMid = Color(0xFF1A4040);
  static const forestLight = Color(0xFF2D5C5C);

  static const cream = Color(0xFFF5F0E8);
  static const creamDark = Color(0xFFE8E2D8);

  static const gold = Color(0xFFC46A3D);
  static const goldLight = Color(0xFFE0A082);
  static const zelligeTeal = Color(0xFF1BA7A6);

  static const textDark = Color(0xFF1A2E2C);
  static const textMuted = Color(0xFF4A5C58);

  static const danger = Color(0xFFE25555);
  static const success = zelligeTeal;
  static const warning = gold;
  static const info = zelligeTeal;

  // Semantic aliases
  static const appBg = cream;
  static const appSurface = Colors.white;
  static const appBorder = creamDark;

  static const brandPrimary = forestDark;
  static const brandAccent = gold;
  static const brandAccent2 = zelligeTeal;

  static const text1 = textDark;
  static const text2 = textMuted;
  static const textInverse = Colors.white;

  static const radiusSm = 10.0;
  static const radiusMd = 12.0;
  static const radiusLg = 16.0;
}
