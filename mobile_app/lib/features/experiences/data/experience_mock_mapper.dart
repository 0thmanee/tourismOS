import '../../../core/data/app_mock_data.dart';
import '../../home/data/home_feed_mock.dart';
import '../domain/experience.dart';

/// Builds an [Experience] from Explore / Home list rows (mock shape).
Experience experienceFromExploreRow(Map<String, dynamic> row, {String? categoryOverride}) {
  final id = row['id'] as String? ?? '';
  final orgId = AppMockData.organizationIdByExperienceId[id] ?? '';
  final category =
      categoryOverride ??
      AppMockData.exploreCategoryByExperienceId[id] ??
      'Experiences';
  final imageRef = row['image'] as String? ?? '';
  return Experience(
    id: id,
    slug: id,
    organizationId: orgId,
    operatorName: orgId.isNotEmpty
        ? (AppMockData.operatorNameByOrgId[orgId] ?? 'Local operator')
        : 'Local operator',
    operatorLogoUrl: imageRef,
    operatorBio:
        orgId.isNotEmpty ? AppMockData.operatorBioByOrgId[orgId] : null,
    title: row['title'] as String? ?? 'Experience',
    summary: row['title'] as String? ?? '',
    city: row['city'] as String? ?? '',
    category: category,
    kind: 'FIXED_SLOT',
    price: ExperiencePrice(
      currency: 'MAD',
      fromMad: (row['priceFromMad'] as num?)?.round() ?? 0,
      depositRequired: false,
      depositMad: null,
      pricingLabel: 'per person',
    ),
    rating: ExperienceRating(
      average: (row['rating'] as num?)?.toDouble(),
      reviewsCount: null,
    ),
    media: ExperienceMedia(
      heroImage: imageRef,
      gallery: [
        if (imageRef.isNotEmpty) imageRef,
      ],
    ),
    logistics: ExperienceLogistics(
      durationLabel: row['duration'] as String? ?? '',
      groupSizeLabel: 'Small group',
      languages: const ['EN'],
      meetingPoint: '',
      meetingNote: null,
    ),
    trust: ExperienceTrust(
      verifiedOperator: row['verified'] == true,
      responseTimeLabel: null,
      cancellationLabel: null,
      confirmationLabel: null,
      popularityLabel: null,
    ),
    bookingConfig: const ExperienceBookingConfig(),
    content: const ExperienceContent(highlights: [], includes: []),
    legacyBookingMode: null,
  );
}

/// Full detail from flat `AppMockData.experienceDetails` entries.
Experience experienceFromDetailMock(Map<String, dynamic> m) {
  final id = m['id'] as String? ?? '';
  final galleryRaw = m['gallery'];
  final gallery = galleryRaw is List
      ? galleryRaw.whereType<String>().toList()
      : <String>[];
  final hero = m['heroImage'] as String? ?? (gallery.isNotEmpty ? gallery.first : '');
  final slotsRaw = m['availableSlots'];
  final slots = slotsRaw is List ? slotsRaw.whereType<String>().toList() : <String>[];
  final durRaw = m['durationOptionsDays'];
  final durDays = durRaw is List
      ? durRaw.map((e) => (e as num).round()).toList()
      : <int>[];
  final langStr = m['languages'] as String? ?? 'EN';
  final languages = langStr.split('/').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();

  final orgId = AppMockData.organizationIdByExperienceId[id] ?? '';
  final opName = orgId.isNotEmpty
      ? (AppMockData.operatorNameByOrgId[orgId] ??
          (m['trustBadge'] as String?) ??
          'Local operator')
      : (m['trustBadge'] as String? ?? 'Local operator');
  return Experience(
    id: id,
    slug: id,
    organizationId: orgId,
    operatorName: opName,
    operatorLogoUrl: hero,
    operatorBio: orgId.isNotEmpty
        ? AppMockData.operatorBioByOrgId[orgId]
        : null,
    title: m['title'] as String? ?? 'Experience',
    summary: m['summary'] as String? ?? '',
    city: m['city'] as String? ?? '',
    category: AppMockData.exploreCategoryByExperienceId[id] ?? 'Experiences',
    kind: m['activityType'] as String? ?? 'FIXED_SLOT',
    price: ExperiencePrice(
      currency: 'MAD',
      fromMad: (m['priceFromMad'] as num?)?.round() ?? 0,
      depositRequired: m['depositRequired'] == true,
      depositMad: (m['depositMad'] as num?)?.round(),
      pricingLabel:
          m['startingPriceType'] == 'per_group' ? 'per group' : 'per person',
    ),
    rating: ExperienceRating(
      average: (m['rating'] as num?)?.toDouble(),
      reviewsCount: (m['reviewsCount'] as num?)?.round(),
    ),
    media: ExperienceMedia(heroImage: hero, gallery: gallery),
    logistics: ExperienceLogistics(
      durationLabel: m['duration'] as String? ?? '',
      groupSizeLabel: m['groupSize'] as String?,
      languages: languages.isEmpty ? const ['EN'] : languages,
      meetingPoint: m['meetingPoint'] as String? ?? '',
      meetingNote: m['meetingNote'] as String?,
    ),
    trust: ExperienceTrust(
      verifiedOperator: m['verified'] == true,
      responseTimeLabel: m['responseTime'] as String?,
      cancellationLabel: m['cancellation'] as String?,
      confirmationLabel: null,
      popularityLabel: null,
    ),
    bookingConfig: ExperienceBookingConfig(
      availableSlots: slots.isEmpty ? null : slots,
      durationOptionsDays: durDays.isEmpty ? null : durDays,
      resourceCapacity: null,
    ),
    content: ExperienceContent(
      highlights:
          (m['highlights'] as List<dynamic>?)?.whereType<String>().toList() ??
          const [],
      includes:
          (m['includes'] as List<dynamic>?)?.whereType<String>().toList() ??
          const [],
    ),
    legacyBookingMode: m['bookingMode'] as String?,
  );
}

/// Merge mock catalog the same way Explore does (dedupe by id).
List<Experience> buildMockMarketplaceCatalog() {
  final all = [
    ...HomeFeedMock.featuredFallback(),
    ...HomeFeedMock.curated('Best in Marrakech'),
    ...HomeFeedMock.curated('Desert escapes'),
    ...HomeFeedMock.curated('Authentic food'),
  ];
  final seen = <String>{};
  final out = <Experience>[];
  for (final raw in all) {
    final id = raw['id'] as String? ?? '';
    if (id.isEmpty || seen.contains(id)) continue;
    seen.add(id);
    out.add(experienceFromExploreRow(raw));
  }
  return out;
}

/// Curated horizontal rows on Home (mock `HomeFeedMock.curated`) → [Experience].
List<Experience> experiencesFromHomeCuratedMaps(List<Map<String, dynamic>> maps) {
  return maps.map((raw) {
    final id = raw['id'] as String? ?? '';
    return experienceFromExploreRow(
      {
        'id': id,
        'title': raw['title'],
        'city': raw['city'] ?? '',
        'duration': raw['duration'] ?? '',
        'priceFromMad': raw['priceFromMad'],
        'rating': raw['rating'],
        'verified': raw['verified'],
        'image': raw['image'],
      },
      categoryOverride: AppMockData.exploreCategoryByExperienceId[id],
    );
  }).toList();
}
