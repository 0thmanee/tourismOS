import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/data/app_mock_data.dart';
import '../../../core/utils/b2c_phone.dart';

/// Last traveler phone used for a successful remote booking (normalized).
/// Used as `phone` query for `GET /v1/trips*` until real auth exists.
final b2cTravelerPhoneProvider = StateProvider<String?>((ref) => null);

String resolveB2cTripsPhoneFromSaved(String? saved) {
  if (saved != null && saved.trim().isNotEmpty) {
    return normalizeB2cPhoneForApi(saved);
  }
  return normalizeB2cPhoneForApi(AppMockData.bookingDemoTravelerPhone);
}
