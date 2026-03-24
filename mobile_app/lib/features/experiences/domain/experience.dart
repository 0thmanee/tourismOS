/// App-layer catalog model — map from API `ExperienceDTO` in one place (`experience_dto_mapper.dart`).
class ExperiencePrice {
  const ExperiencePrice({
    required this.currency,
    required this.fromMad,
    required this.depositRequired,
    this.depositMad,
    required this.pricingLabel,
  });

  final String currency;
  final int fromMad;
  final bool depositRequired;
  final int? depositMad;
  final String pricingLabel;
}

class ExperienceRating {
  const ExperienceRating({this.average, this.reviewsCount});

  final double? average;
  final int? reviewsCount;
}

class ExperienceMedia {
  const ExperienceMedia({required this.heroImage, required this.gallery});

  final String heroImage;
  final List<String> gallery;

  String get primaryImageRef {
    if (heroImage.trim().isNotEmpty) return heroImage;
    if (gallery.isNotEmpty) return gallery.first;
    return '';
  }

  List<String> get orderedGalleryRefs {
    final seen = <String>{};
    final out = <String>[];
    for (final u in [heroImage, ...gallery]) {
      final t = u.trim();
      if (t.isEmpty || seen.contains(t)) continue;
      seen.add(t);
      out.add(t);
    }
    return out;
  }
}

class ExperienceLogistics {
  const ExperienceLogistics({
    required this.durationLabel,
    this.groupSizeLabel,
    required this.languages,
    required this.meetingPoint,
    this.meetingNote,
  });

  final String durationLabel;
  final String? groupSizeLabel;
  final List<String> languages;
  final String meetingPoint;
  final String? meetingNote;

  String get languagesJoined {
    if (languages.isEmpty) return 'EN';
    return languages.join(' / ');
  }
}

class ExperienceTrust {
  const ExperienceTrust({
    required this.verifiedOperator,
    this.responseTimeLabel,
    this.cancellationLabel,
    this.confirmationLabel,
    this.popularityLabel,
  });

  final bool verifiedOperator;
  final String? responseTimeLabel;
  final String? cancellationLabel;
  final String? confirmationLabel;
  final String? popularityLabel;
}

class ExperienceBookingConfig {
  const ExperienceBookingConfig({
    this.availableSlots,
    this.durationOptionsDays,
    this.resourceCapacity,
  });

  final List<String>? availableSlots;
  final List<int>? durationOptionsDays;
  final int? resourceCapacity;
}

class ExperienceContent {
  const ExperienceContent({required this.highlights, required this.includes});

  final List<String> highlights;
  final List<String> includes;
}

class Experience {
  const Experience({
    required this.id,
    required this.slug,
    required this.organizationId,
    required this.operatorName,
    required this.title,
    required this.summary,
    required this.city,
    required this.category,
    required this.kind,
    required this.price,
    required this.rating,
    required this.media,
    required this.logistics,
    required this.trust,
    required this.bookingConfig,
    required this.content,
    this.legacyBookingMode,
  });

  final String id;
  final String slug;
  final String organizationId;
  final String operatorName;
  final String title;
  final String summary;
  final String city;
  final String category;

  /// API `ActivityKind`: FIXED_SLOT | FLEXIBLE | MULTI_DAY | RESOURCE_BASED
  final String kind;
  final ExperiencePrice price;
  final ExperienceRating rating;
  final ExperienceMedia media;
  final ExperienceLogistics logistics;
  final ExperienceTrust trust;
  final ExperienceBookingConfig bookingConfig;
  final ExperienceContent content;

  /// Mock-only: preserves demo `bookingMode` when it diverges from [kind] (API omits this).
  final String? legacyBookingMode;

  /// Wizard / CTA: request-style UX (no instant payment). Used by booking `paymentIntent` mapping.
  ///
  /// [isRequestConfirmation] is a broader server-shape hint (includes [RESOURCE_BASED]); booking
  /// POST uses **this** getter for `PAY_LATER`, not [isRequestConfirmation], so intent stays aligned
  /// with what the payment step actually shows.
  bool get uiTreatAsRequestBooking {
    if (legacyBookingMode == 'REQUEST') return true;
    if (legacyBookingMode == 'INSTANT') return false;
    return kind == 'FLEXIBLE' || kind == 'MULTI_DAY';
  }

  /// Server-oriented request flow (API); not used for mock INSTANT edge cases.
  bool get isRequestConfirmation {
    return kind == 'FLEXIBLE' ||
        kind == 'MULTI_DAY' ||
        kind == 'RESOURCE_BASED';
  }
}
