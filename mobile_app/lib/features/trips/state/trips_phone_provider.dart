import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/utils/b2c_phone.dart';

/// Last traveler phone used for a successful remote booking (normalized).
/// Optional `phone` query for legacy bookings without `travelerUserId`; session-owned trips need no phone.
final b2cTravelerPhoneProvider = StateProvider<String?>((ref) => null);

/// Normalized phone hint for APIs, or null (server uses session + `travelerUserId` only).
String? b2cTripsPhoneQueryHint(String? saved) {
  if (saved == null || saved.trim().isEmpty) return null;
  return normalizeB2cPhoneForApi(saved);
}
