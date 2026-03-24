import '../../experiences/domain/experience.dart';

/// Flat map shape used by [BookingFlowScreen] steps (legacy mock + API-backed flow).
Map<String, dynamic> bookingDetailMapFromExperience(Experience e) {
  final slots = e.bookingConfig.availableSlots;
  final durationDays = e.bookingConfig.durationOptionsDays;
  final bookingMode =
      e.legacyBookingMode ?? (e.uiTreatAsRequestBooking ? 'REQUEST' : 'INSTANT');
  return {
    'id': e.id,
    'title': e.title,
    'activityType': e.kind,
    'bookingMode': bookingMode,
    'depositMad': e.price.depositMad ?? 0,
    'depositRequired': e.price.depositRequired,
    'availableSlots': (slots != null && slots.isNotEmpty)
        ? slots
        : <String>['10:00'],
    'priceFromMad': e.price.fromMad,
    'durationOptionsDays': (durationDays != null && durationDays.isNotEmpty)
        ? durationDays
        : <int>[1],
    'meetingPoint': e.logistics.meetingPoint,
    'heroImage': e.media.primaryImageRef,
    'city': e.city,
    'trustBadge': e.operatorName,
  };
}
