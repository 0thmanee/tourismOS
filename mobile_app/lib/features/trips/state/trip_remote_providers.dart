import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/trip_dto_mapper.dart';
import 'bookings_providers.dart';
import 'trips_phone_provider.dart';

final tripRemoteDetailProvider = FutureProvider.autoDispose
    .family<Map<String, dynamic>, String>((ref, bookingId) async {
  ref.watch(b2cTravelerPhoneProvider);
  final api = ref.watch(bookingsApiProvider);
  final phone =
      resolveB2cTripsPhoneFromSaved(ref.read(b2cTravelerPhoneProvider));
  final dto = await api.fetchTrip(bookingId: bookingId, phone: phone);
  return tripItemFromTripDto(dto);
});
