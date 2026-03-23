/// Placeholder catalog until `GET /api/experiences` is live.
class HomeFeedMock {
  static const categories = <Map<String, dynamic>>[
    {'id': 'culture', 'label': 'Culture', 'icon': 'museum'},
    {'id': 'adventure', 'label': 'Adventure', 'icon': 'terrain'},
    {'id': 'food', 'label': 'Food', 'icon': 'restaurant'},
    {'id': 'desert', 'label': 'Desert', 'icon': 'wb_sunny'},
    {'id': 'surf', 'label': 'Surf', 'icon': 'surfing'},
    {'id': 'nature', 'label': 'Nature', 'icon': 'forest'},
  ];

  static const cities = <Map<String, dynamic>>[
    {'name': 'Marrakech', 'image': null},
    {'name': 'Taghazout', 'image': null},
    {'name': 'Fes', 'image': null},
    {'name': 'Essaouira', 'image': null},
  ];

  static List<Map<String, dynamic>> featuredFallback() => [
        {
          'title': 'Agafay Sunset Quad Ride',
          'city': 'Marrakech',
          'duration': '2 hours',
          'priceFromMad': 450,
          'verified': true,
          'rating': 4.8,
        },
        {
          'title': 'Atlas Day Hike — Berber Villages',
          'city': 'Marrakech',
          'duration': '8 hours',
          'priceFromMad': 850,
          'verified': true,
          'rating': 4.9,
        },
        {
          'title': 'Taghazout Surf Lesson',
          'city': 'Taghazout',
          'duration': '2 hours',
          'priceFromMad': 350,
          'verified': false,
          'rating': 4.7,
        },
      ];

  /// Curated horizontal rows — placeholder content until API provides collections.
  static List<Map<String, dynamic>> curated(String sectionTitle) {
    return [
      {
        'title': 'Medina Food & Stories',
        'city': 'Marrakech',
        'duration': '3 hours',
        'priceFromMad': 550,
        'verified': true,
        'rating': 4.8,
        'section': sectionTitle,
      },
      {
        'title': 'Coastal Sunset Walk',
        'city': 'Essaouira',
        'duration': '2 hours',
        'priceFromMad': 200,
        'verified': true,
        'rating': 4.6,
        'section': sectionTitle,
      },
    ];
  }
}
