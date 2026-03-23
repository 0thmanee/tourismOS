import 'package:flutter_riverpod/flutter_riverpod.dart';

typedef TripItem = Map<String, dynamic>;

final tripsStoreProvider =
    StateNotifierProvider<TripsStore, List<TripItem>>((ref) => TripsStore());

class TripsStore extends StateNotifier<List<TripItem>> {
  TripsStore() : super(seedTrips);

  static final List<TripItem> seedTrips = [
    {
      'bookingId': 'BK-240901',
      'experienceId': 'agafay-quad',
      'title': 'Agafay Sunset Quad Ride',
      'city': 'Marrakech',
      'heroImage': 'assets/images/home/exp_agafay_quad.jpg',
      'status': 'Confirmed',
      'paymentStatus': 'Deposit paid',
      'bookingType': 'RESOURCE_BASED',
      'operatorName': 'Atlas Motion Adventures',
      'meetingPoint': 'Pickup in Gueliz or Medina',
      'travelers': 2,
      'startAt': DateTime.now().add(const Duration(days: 2)).toIso8601String(),
    },
    {
      'bookingId': 'BK-240455',
      'experienceId': 'taghazout-surf',
      'title': 'Taghazout Surf Lesson',
      'city': 'Taghazout',
      'heroImage': 'assets/images/home/exp_taghazout_surf.jpg',
      'status': 'Completed',
      'paymentStatus': 'Paid',
      'bookingType': 'FIXED_SLOT',
      'operatorName': 'Ocean Roots Surf School',
      'meetingPoint': 'Taghazout main beach',
      'travelers': 1,
      'startAt': DateTime.now().subtract(const Duration(days: 7)).toIso8601String(),
    },
  ];

  void addTrip(TripItem item) {
    state = [item, ...state];
  }
}
