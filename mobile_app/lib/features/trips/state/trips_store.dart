import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/data/app_mock_data.dart';

typedef TripItem = Map<String, dynamic>;

final tripsStoreProvider =
    StateNotifierProvider<TripsStore, List<TripItem>>((ref) => TripsStore());

class TripsStore extends StateNotifier<List<TripItem>> {
  TripsStore() : super(seedTrips);

  static final List<TripItem> seedTrips = AppMockData.seedTrips();

  void addTrip(TripItem item) {
    state = [item, ...state];
  }

  void prependTrip(TripItem item) {
    final id = item['bookingId'] as String?;
    final rest = id == null
        ? state
        : state.where((t) => t['bookingId'] != id).toList();
    state = [item, ...rest];
  }

  void replaceAll(List<TripItem> items) {
    state = List<TripItem>.from(items);
  }
}
