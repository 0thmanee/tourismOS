/// Labels aligned with demo wizard chips (`bookingDemoDateOptions`) → month/day.
const _demoDayAnchors = <String, ({int month, int day})>{
  'Fri, Mar 27': (month: 3, day: 27),
  'Sat, Mar 28': (month: 3, day: 28),
  'Sun, Mar 29': (month: 3, day: 29),
  'Mon, Mar 30': (month: 3, day: 30),
};

const _monthAbbrev = <String, int>{
  'jan': 1,
  'feb': 2,
  'mar': 3,
  'apr': 4,
  'may': 5,
  'jun': 6,
  'jul': 7,
  'aug': 8,
  'sep': 9,
  'oct': 10,
  'nov': 11,
  'dec': 12,
};

/// Parses `Weekday, Mon DD` (e.g. `Sat, Mar 28`) for remote/catalog flows that reuse the same chip labels.
DateTime? _parseWeekdayMonthDayLabel(String label) {
  final comma = label.indexOf(',');
  if (comma < 0 || comma >= label.length - 1) return null;
  final rest = label.substring(comma + 1).trim();
  final parts = rest.split(RegExp(r'\s+'));
  if (parts.length < 2) return null;
  final monKey = parts[0].toLowerCase();
  final mon = monKey.length >= 3 ? monKey.substring(0, 3) : monKey;
  final month = _monthAbbrev[mon];
  final day = int.tryParse(parts[1]);
  if (month == null || day == null || day < 1 || day > 31) return null;
  final y = DateTime.now().year;
  return DateTime(y, month, day);
}

DateTime _ensureFutureDay(DateTime date, int hour, int minute) {
  var dt = DateTime(date.year, date.month, date.day, hour, minute);
  final now = DateTime.now();
  if (!dt.isBefore(now)) return dt;
  return DateTime(date.year + 1, date.month, date.day, hour, minute);
}

/// Combines wizard date label + `HH:mm` slot into a local [DateTime] for `startAtISO`.
DateTime combineBookingDateTime(String dateLabel, String slotTime) {
  final time = _parseSlot(slotTime);
  final anchor = _demoDayAnchors[dateLabel];
  if (anchor != null) {
    final d = DateTime(DateTime.now().year, anchor.month, anchor.day);
    return _ensureFutureDay(d, time.hour, time.minute);
  }
  final parsed = _parseWeekdayMonthDayLabel(dateLabel);
  if (parsed != null) {
    return _ensureFutureDay(parsed, time.hour, time.minute);
  }
  final base = DateTime.now().add(const Duration(days: 3));
  return DateTime(
    base.year,
    base.month,
    base.day,
    time.hour,
    time.minute,
  );
}

({int hour, int minute}) _parseSlot(String slot) {
  final parts = slot.split(':');
  if (parts.length >= 2) {
    final h = int.tryParse(parts[0].trim()) ?? 10;
    final m = int.tryParse(parts[1].trim()) ?? 0;
    return (hour: h.clamp(0, 23), minute: m.clamp(0, 59));
  }
  return (hour: 10, minute: 0);
}
