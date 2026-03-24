import '../../../core/utils/json_read.dart';

/// Normalizes API [TripDTO] + booking create `trip` into the map shape used by Trips UI.
Map<String, dynamic> tripItemFromTripDto(Map<String, dynamic> dto) {
  final iso = dto['startAtISO'] as String? ?? '';
  final start = DateTime.tryParse(iso);
  final statusRaw = (dto['status'] as String? ?? 'CONFIRMED').toUpperCase();
  final payRaw = (dto['paymentStatus'] as String? ?? 'UNPAID').toUpperCase();
  final summary = dto['summary'];
  Map<String, dynamic>? summaryMap;
  if (summary is Map<String, dynamic>) {
    summaryMap = summary;
  } else if (summary is Map) {
    summaryMap = Map<String, dynamic>.from(summary);
  }
  final travelers = readInt(dto['travelers'], 1);

  return {
    'bookingId': dto['bookingId'],
    'experienceId': dto['experienceId'],
    'title': dto['title'],
    'city': dto['city'],
    'heroImage': dto['heroImage'],
    'status': _statusDisplay(statusRaw),
    'paymentStatus': _paymentDisplay(payRaw),
    'bookingType': dto['bookingType'],
    'operatorName': dto['operatorName'],
    'meetingPoint': dto['meetingPoint'],
    'meetingNote': dto['meetingNote'],
    'travelers': travelers,
    'startAt': start != null ? start.toIso8601String() : '',
    'timeLabel': start != null ? _formatTime(start) : '—',
    'dateLabel': start != null ? _formatDateLabel(start) : 'Date TBD',
    'summary': summaryMap,
    'documents': dto['documents'],
    '_apiStatus': statusRaw,
    '_apiPaymentStatus': payRaw,
  };
}

String _statusDisplay(String api) {
  switch (api) {
    case 'NEW':
    case 'PENDING':
      return 'Pending';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'COMPLETED':
      return 'Completed';
    default:
      return api;
  }
}

String _paymentDisplay(String api) {
  switch (api) {
    case 'UNPAID':
      return 'Unpaid';
    case 'DEPOSIT':
      return 'Deposit';
    case 'PAID':
      return 'Paid';
    default:
      return api;
  }
}

String _formatTime(DateTime d) {
  final h = d.hour.toString().padLeft(2, '0');
  final m = d.minute.toString().padLeft(2, '0');
  return '$h:$m';
}

String _formatDateLabel(DateTime d) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return '${days[(d.weekday - 1) % 7]}, ${months[d.month - 1]} ${d.day}';
}
