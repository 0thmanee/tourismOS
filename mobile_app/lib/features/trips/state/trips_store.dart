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
}
