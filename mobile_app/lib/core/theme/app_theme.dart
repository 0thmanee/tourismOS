import 'package:flutter/material.dart';
import 'app_tokens.dart';

class AppTheme {
  static ThemeData get light {
    const colorScheme = ColorScheme(
      brightness: Brightness.light,
      primary: AppTokens.brandPrimary,
      onPrimary: AppTokens.textInverse,
      secondary: AppTokens.brandAccent,
      onSecondary: AppTokens.forestDark,
      error: AppTokens.danger,
      onError: AppTokens.textInverse,
      surface: AppTokens.appSurface,
      onSurface: AppTokens.text1,
    );
    // Local bundled fonts:
    // - Display/headlines: Cinzel
    // - UI/body: Manrope
    final bodyBase = Typography.material2021().black.apply(
      fontFamily: 'Manrope',
      bodyColor: AppTokens.text1,
      displayColor: AppTokens.text1,
    );
    final headingBase = bodyBase.apply(fontFamily: 'Cinzel');

    return ThemeData(
      useMaterial3: true,
      fontFamily: 'Manrope',
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppTokens.appBg,
      textTheme: headingBase.copyWith(
        displayLarge: headingBase.displayLarge?.copyWith(
          color: AppTokens.text1,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.3,
        ),
        displayMedium: headingBase.displayMedium?.copyWith(
          color: AppTokens.text1,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.25,
        ),
        headlineLarge: headingBase.headlineLarge?.copyWith(
          color: AppTokens.text1,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.2,
        ),
        headlineSmall: headingBase.headlineSmall?.copyWith(
          color: AppTokens.text1,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.18,
        ),
        headlineMedium: headingBase.headlineMedium?.copyWith(
          color: AppTokens.text1,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.16,
        ),
        titleLarge: headingBase.titleLarge?.copyWith(
          color: AppTokens.text1,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.12,
        ),
        titleMedium: bodyBase.titleMedium?.copyWith(
          color: AppTokens.text1,
          fontWeight: FontWeight.w700,
        ),
        titleSmall: bodyBase.titleSmall?.copyWith(
          color: AppTokens.text1,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: bodyBase.bodyLarge?.copyWith(
          color: AppTokens.text1,
          height: 1.35,
        ),
        bodyMedium: bodyBase.bodyMedium?.copyWith(
          color: AppTokens.text1,
          height: 1.32,
        ),
        bodySmall: bodyBase.bodySmall?.copyWith(
          color: AppTokens.text2,
          height: 1.3,
        ),
        labelLarge: bodyBase.labelLarge?.copyWith(
          color: AppTokens.text1,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.1,
        ),
        labelSmall: bodyBase.labelSmall?.copyWith(
          color: AppTokens.text2,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.08,
        ),
      ),
      appBarTheme: const AppBarTheme(
        centerTitle: false,
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: AppTokens.text1,
      ),
      cardTheme: CardThemeData(
        color: AppTokens.appSurface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: AppTokens.appBorder),
          borderRadius: BorderRadius.circular(AppTokens.radiusLg),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppTokens.appSurface,
        isDense: true,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 12,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppTokens.radiusMd),
          borderSide: const BorderSide(color: AppTokens.appBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppTokens.radiusMd),
          borderSide: const BorderSide(color: AppTokens.appBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppTokens.radiusMd),
          borderSide: const BorderSide(color: AppTokens.brandAccent, width: 1.4),
        ),
        labelStyle: const TextStyle(color: AppTokens.text2),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppTokens.brandPrimary,
          foregroundColor: AppTokens.textInverse,
          minimumSize: const Size.fromHeight(46),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppTokens.radiusMd),
          ),
          textStyle: bodyBase.labelLarge?.copyWith(fontWeight: FontWeight.w700),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppTokens.text1,
          side: const BorderSide(color: AppTokens.appBorder),
          minimumSize: const Size.fromHeight(46),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppTokens.radiusMd),
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppTokens.brandPrimary,
          textStyle: bodyBase.labelLarge?.copyWith(fontWeight: FontWeight.w600),
        ),
      ),
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTokens.radiusMd),
        ),
        side: const BorderSide(color: AppTokens.appBorder),
        backgroundColor: AppTokens.appSurface,
        selectedColor: AppTokens.brandAccent.withValues(alpha: 0.16),
        labelStyle: bodyBase.bodySmall?.copyWith(color: AppTokens.text1),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppTokens.appSurface,
        indicatorColor: AppTokens.brandAccent.withValues(alpha: 0.2),
        labelTextStyle: WidgetStateProperty.resolveWith(
          (states) => bodyBase.labelSmall?.copyWith(
            color: states.contains(WidgetState.selected)
                ? AppTokens.brandPrimary
                : AppTokens.text2,
            fontWeight: states.contains(WidgetState.selected)
                ? FontWeight.w700
                : FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
