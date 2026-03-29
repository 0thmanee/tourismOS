import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'bookings_providers.dart';
import 'trips_phone_provider.dart';

final bookingMessagesProvider = FutureProvider.autoDispose
    .family<List<Map<String, dynamic>>, String>((ref, bookingId) async {
  ref.watch(b2cTravelerPhoneProvider);
  final phone = b2cTripsPhoneQueryHint(ref.read(b2cTravelerPhoneProvider));
  final api = ref.watch(bookingsApiProvider);
  return api.listBookingMessages(bookingId: bookingId, phone: phone);
});
