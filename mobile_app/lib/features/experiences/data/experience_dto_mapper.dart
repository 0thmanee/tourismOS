// Temporary DTO rules from the API (see Unified_B2C doc): null ratings, deposit flags,
// and trust.popularity stay honest until reviews/deposits are modeled server-side.
import '../domain/experience.dart';

Map<String, dynamic> _asMap(dynamic v) {
  if (v is Map<String, dynamic>) return v;
  if (v is Map) return Map<String, dynamic>.from(v);
  return {};
}

List<String> _stringList(dynamic v) {
  if (v is! List) return [];
  return v.whereType<String>().toList();
}

List<int> _intList(dynamic v) {
  if (v is! List) return [];
  final out = <int>[];
  for (final x in v) {
    if (x is int) {
      out.add(x);
    } else if (x is num) {
      out.add(x.round());
    }
  }
  return out;
}

int _asInt(dynamic v, [int fallback = 0]) {
  if (v is int) return v;
  if (v is num) return v.round();
  return fallback;
}

bool _asBool(dynamic v, [bool fallback = false]) {
  if (v is bool) return v;
  return fallback;
}

double? _asDouble(dynamic v) {
  if (v is double) return v;
  if (v is int) return v.toDouble();
  if (v is num) return v.toDouble();
  return null;
}

int? _asIntNullable(dynamic v) {
  if (v == null) return null;
  if (v is int) return v;
  if (v is num) return v.round();
  return null;
}

/// Parses a single `ExperienceDTO` object from `/api/v1/experiences` list or detail `item`.
Experience experienceFromApiDto(Map<String, dynamic> json) {
  final price = _asMap(json['price']);
  final rating = _asMap(json['rating']);
  final media = _asMap(json['media']);
  final logistics = _asMap(json['logistics']);
  final trust = _asMap(json['trust']);
  final booking = _asMap(json['bookingConfig']);
  final content = _asMap(json['content']);

  return Experience(
    id: json['id'] as String? ?? '',
    slug: json['slug'] as String? ?? '',
    organizationId: json['organizationId'] as String? ?? '',
    operatorName: json['operatorName'] as String? ?? '',
    title: json['title'] as String? ?? 'Experience',
    summary: json['summary'] as String? ?? '',
    city: json['city'] as String? ?? '',
    category: json['category'] as String? ?? 'Experiences',
    kind: json['kind'] as String? ?? 'FLEXIBLE',
    price: ExperiencePrice(
      currency: price['currency'] as String? ?? 'MAD',
      fromMad: _asInt(price['fromMad']),
      depositRequired: _asBool(price['depositRequired']),
      depositMad: _asIntNullable(price['depositMad']),
      pricingLabel: price['pricingLabel'] as String? ?? 'per person',
    ),
    rating: ExperienceRating(
      average: _asDouble(rating['average']),
      reviewsCount: _asIntNullable(rating['reviewsCount']),
    ),
    media: ExperienceMedia(
      heroImage: media['heroImage'] as String? ?? '',
      gallery: _stringList(media['gallery']),
    ),
    logistics: ExperienceLogistics(
      durationLabel: logistics['durationLabel'] as String? ?? '',
      groupSizeLabel: logistics['groupSizeLabel'] as String?,
      languages: _stringList(logistics['languages']),
      meetingPoint: logistics['meetingPoint'] as String? ?? '',
      meetingNote: logistics['meetingNote'] as String?,
    ),
    trust: ExperienceTrust(
      verifiedOperator: _asBool(trust['verifiedOperator']),
      responseTimeLabel: trust['responseTimeLabel'] as String?,
      cancellationLabel: trust['cancellationLabel'] as String?,
      confirmationLabel: trust['confirmationLabel'] as String?,
      popularityLabel: trust['popularityLabel'] as String?,
    ),
    bookingConfig: ExperienceBookingConfig(
      availableSlots: () {
        final s = booking['availableSlots'];
        final list = _stringList(s);
        return list.isEmpty ? null : list;
      }(),
      durationOptionsDays: () {
        final d = booking['durationOptionsDays'];
        final list = _intList(d);
        return list.isEmpty ? null : list;
      }(),
      resourceCapacity: _asIntNullable(booking['resourceCapacity']),
    ),
    content: ExperienceContent(
      highlights: _stringList(content['highlights']),
      includes: _stringList(content['includes']),
    ),
    legacyBookingMode: null,
  );
}
