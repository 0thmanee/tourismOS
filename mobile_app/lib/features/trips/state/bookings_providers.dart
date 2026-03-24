import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../data/bookings_api.dart';

final bookingsApiProvider = Provider<BookingsApi>((ref) {
  return BookingsApi(ref.watch(dioProvider));
});
