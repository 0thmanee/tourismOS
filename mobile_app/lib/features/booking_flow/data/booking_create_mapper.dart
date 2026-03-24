import '../../../core/utils/b2c_phone.dart';
import '../../experiences/domain/experience.dart';
import 'booking_datetime.dart';

bool _looksLikeEmail(String s) {
  return RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(s);
}

/// Single place that builds the JSON body for `POST /api/v1/bookings`.
Map<String, dynamic> bookingCreateRequestFromDraft({
  required Experience experience,
  required String selectedDateLabel,
  required String selectedSlot,
  required int guests,
  required int durationDays,
  required int resourceUnits,
  required String paymentChoice,
  required String name,
  required String phone,
  required String email,
  required String notes,
}) {
  final startAt = combineBookingDateTime(selectedDateLabel, selectedSlot);
  final priceMad = experience.price.fromMad * guests;
  final mode = _paymentIntentMode(
    experience: experience,
    paymentChoice: paymentChoice,
  );

  final meta = <String, dynamic>{};
  final kind = experience.kind;
  if (kind == 'FIXED_SLOT' || kind == 'FLEXIBLE') {
    meta['slotTime'] = selectedSlot;
  }
  if (kind == 'MULTI_DAY') {
    meta['durationDays'] = durationDays;
  }
  if (kind == 'RESOURCE_BASED') {
    meta['resourceUnits'] = resourceUnits;
  }
  if (notes.trim().isNotEmpty) {
    meta['notes'] = notes.trim();
  }

  final emailTrim = email.trim();
  final customer = <String, dynamic>{
    'name': name.trim(),
    'phone': normalizeB2cPhoneForApi(phone),
    if (emailTrim.isNotEmpty && _looksLikeEmail(emailTrim)) 'email': emailTrim,
  };

  return {
    'experienceId': experience.id,
    'priceMad': priceMad,
    'customer': customer,
    'booking': {
      'startAtISO': startAt.toIso8601String(),
      'peopleCount': guests,
      if (meta.isNotEmpty) 'meta': meta,
    },
    'paymentIntent': {
      'mode': mode,
    },
  };
}

String _paymentIntentMode({
  required Experience experience,
  required String paymentChoice,
}) {
  if (experience.uiTreatAsRequestBooking) {
    return 'PAY_LATER';
  }
  if (paymentChoice == 'later') {
    return 'PAY_LATER';
  }
  // Deposit path only when a positive amount exists; depositRequired without
  // amount falls back to PAY_FULL until backend defines a separate rule.
  if (experience.price.depositRequired &&
      (experience.price.depositMad ?? 0) > 0) {
    return 'PAY_DEPOSIT';
  }
  return 'PAY_FULL';
}
