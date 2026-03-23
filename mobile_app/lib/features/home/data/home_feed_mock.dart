/// Placeholder catalog until `GET /api/experiences` is live.
class HomeFeedMock {
  static const hero = <String, dynamic>{
    'title': 'Your next Moroccan memory starts here',
    'subtitle': 'Handpicked experiences. Clear booking. Zero chaos.',
    'ctaPrimary': 'Start exploring',
    'ctaSecondary': 'View trips',
    'image': 'assets/images/home/home_hero.jpg',
    'experienceId': 'agafay-quad',
  };

  static const categories = <Map<String, dynamic>>[
    {'id': 'culture', 'label': 'Culture', 'icon': 'museum'},
    {'id': 'adventure', 'label': 'Adventure', 'icon': 'terrain'},
    {'id': 'food', 'label': 'Food', 'icon': 'restaurant'},
    {'id': 'desert', 'label': 'Desert', 'icon': 'wb_sunny'},
    {'id': 'surf', 'label': 'Surf', 'icon': 'surfing'},
    {'id': 'nature', 'label': 'Nature', 'icon': 'forest'},
  ];

  static const cities = <Map<String, dynamic>>[
    {'name': 'Marrakech', 'image': 'assets/images/home/city_marrakech.jpg'},
    {'name': 'Taghazout', 'image': 'assets/images/home/city_taghazout.jpg'},
    {'name': 'Fes', 'image': 'assets/images/home/city_fes.jpg'},
    {'name': 'Essaouira', 'image': 'assets/images/home/city_essaouira.jpg'},
  ];

  static List<Map<String, dynamic>> featuredFallback() => [
        {
          'id': 'agafay-quad',
          'title': 'Agafay Sunset Quad Ride',
          'city': 'Marrakech',
          'duration': '2 hours',
          'priceFromMad': 450,
          'verified': true,
          'rating': 4.8,
          'image': 'assets/images/home/exp_agafay_quad.jpg',
        },
        {
          'id': 'atlas-hike',
          'title': 'Atlas Day Hike — Berber Villages',
          'city': 'Marrakech',
          'duration': '8 hours',
          'priceFromMad': 850,
          'verified': true,
          'rating': 4.9,
          'image': 'assets/images/home/exp_atlas_hike.jpg',
        },
        {
          'id': 'taghazout-surf',
          'title': 'Taghazout Surf Lesson',
          'city': 'Taghazout',
          'duration': '2 hours',
          'priceFromMad': 350,
          'verified': false,
          'rating': 4.7,
          'image': 'assets/images/home/exp_taghazout_surf.jpg',
        },
      ];

  static const quickActions = <Map<String, dynamic>>[
    {
      'title': 'Book this weekend',
      'subtitle': 'Ready-to-go slots',
      'image': 'assets/images/home/action_weekend.jpg',
    },
    {
      'title': 'Desert escapes',
      'subtitle': 'Sunset and stargazing',
      'image': 'assets/images/home/action_desert.jpg',
    },
  ];

  /// Curated horizontal rows — all mocked.
  static List<Map<String, dynamic>> curated(String sectionTitle) {
    if (sectionTitle == 'Best in Marrakech') {
      return [
        {
          'id': 'medina-food-stories',
          'title': 'Medina Food & Stories',
          'city': 'Marrakech',
          'duration': '3 hours',
          'priceFromMad': 550,
          'verified': true,
          'rating': 4.8,
          'section': sectionTitle,
          'image': 'assets/images/home/curated_marrakech_food.jpg',
        },
        {
          'id': 'marrakech-rooftop-dinner',
          'title': 'Marrakech Rooftop Dinner',
          'city': 'Marrakech',
          'duration': '2.5 hours',
          'priceFromMad': 620,
          'verified': true,
          'rating': 4.7,
          'section': sectionTitle,
          'image': 'assets/images/home/curated_marrakech_rooftop.jpg',
        },
      ];
    }

    if (sectionTitle == 'Desert escapes') {
      return [
        {
          'id': 'agafay-camp-evening',
          'title': 'Agafay Camp Evening',
          'city': 'Agafay',
          'duration': '6 hours',
          'priceFromMad': 780,
          'verified': true,
          'rating': 4.8,
          'section': sectionTitle,
          'image': 'assets/images/home/curated_desert_camp.jpg',
        },
        {
          'id': 'merzouga-camel-ride',
          'title': 'Camel Ride at Golden Hour',
          'city': 'Merzouga',
          'duration': '1.5 hours',
          'priceFromMad': 320,
          'verified': true,
          'rating': 4.6,
          'section': sectionTitle,
          'image': 'assets/images/home/curated_desert_camel.jpg',
        },
      ];
    }

    return [
      {
        'id': 'fes-cooking-class',
        'title': 'Cooking Class in Riad',
        'city': 'Fes',
        'duration': '3.5 hours',
        'priceFromMad': 460,
        'verified': true,
        'rating': 4.7,
        'section': sectionTitle,
        'image': 'assets/images/home/curated_food_cooking.jpg',
      },
      {
        'id': 'essaouira-ocean-grill',
        'title': 'Ocean Grill by the Port',
        'city': 'Essaouira',
        'duration': '2.5 hours',
        'priceFromMad': 380,
        'verified': true,
        'rating': 4.6,
        'section': sectionTitle,
        'image': 'assets/images/home/curated_food_ocean.jpg',
      },
    ];
  }
}
