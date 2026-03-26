import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Bootstrap state for splash → onboarding → auth → main app.
///
/// Keys and routing rules are documented in `docs/ENTRY_SCREENS.md`.
class LaunchController extends ChangeNotifier {
  LaunchController();

  static const _kOnboarding = 'me_onboarding_completed';
  static const _kSession = 'me_session_ready';
  static const _kInterests = 'me_interests_json';
  static const _kCity = 'me_preferred_city';
  static const _kLanguage = 'me_preferred_language';
  static const _kGuest = 'me_is_guest';

  SharedPreferences? _prefs;
  bool _loaded = false;

  Future<void> _ensureLoaded() async {
    if (_loaded && _prefs != null) return;
    _prefs = await SharedPreferences.getInstance();
    _loaded = true;
  }

  bool get isLoaded => _loaded;
  bool get onboardingCompleted => _prefs?.getBool(_kOnboarding) ?? false;
  bool get sessionReady => _prefs?.getBool(_kSession) ?? false;
  bool get isGuest => _prefs?.getBool(_kGuest) ?? false;

  List<String> get interests {
    final raw = _prefs?.getString(_kInterests);
    if (raw == null || raw.isEmpty) return [];
    try {
      final list = jsonDecode(raw) as List<dynamic>?;
      return list?.map((e) => e.toString()).toList() ?? [];
    } catch (_) {
      return [];
    }
  }

  String? get preferredCity => _prefs?.getString(_kCity);
  String get preferredLanguage => _prefs?.getString(_kLanguage) ?? 'en';

  Future<void> load() async {
    await _ensureLoaded();
    notifyListeners();
  }

  Future<void> setOnboardingCompleted({bool value = true}) async {
    await _ensureLoaded();
    await _prefs?.setBool(_kOnboarding, value);
    notifyListeners();
  }

  Future<void> setSessionReady({
    bool value = true,
    bool guest = false,
  }) async {
    await _ensureLoaded();
    await _prefs?.setBool(_kSession, value);
    await _prefs?.setBool(_kGuest, guest);
    notifyListeners();
  }

  /// Clear only auth/session state while keeping onboarding + personalization.
  Future<void> signOut() async {
    await _ensureLoaded();
    await _prefs?.remove(_kSession);
    await _prefs?.remove(_kGuest);
    notifyListeners();
  }

  Future<void> savePersonalization({
    required List<String> interests,
    String? cityCode,
    String? languageCode,
  }) async {
    await _ensureLoaded();
    await _prefs?.setString(_kInterests, jsonEncode(interests));
    if (cityCode != null && cityCode.isNotEmpty) {
      await _prefs?.setString(_kCity, cityCode);
    }
    if (languageCode != null && languageCode.isNotEmpty) {
      await _prefs?.setString(_kLanguage, languageCode);
    }
    notifyListeners();
  }

  /// Dev / QA: reset entry flow.
  Future<void> debugResetEntryFlow() async {
    await _ensureLoaded();
    await _prefs?.remove(_kOnboarding);
    await _prefs?.remove(_kSession);
    await _prefs?.remove(_kGuest);
    await _prefs?.remove(_kInterests);
    await _prefs?.remove(_kCity);
    notifyListeners();
  }
}
