import 'package:flutter/material.dart';

class AppImagePreloader {
  AppImagePreloader._();

  static bool _started = false;

  /// Warms up static [assetPaths] once per app process.
  static Future<void> warmUp(
    BuildContext context,
    Iterable<String> assetPaths,
  ) async {
    if (_started) return;
    _started = true;

    for (final path in assetPaths.toSet()) {
      try {
        await precacheImage(AssetImage(path), context);
      } catch (_) {
        // Ignore missing/bad assets so preload never blocks app startup.
      }
    }
  }
}
