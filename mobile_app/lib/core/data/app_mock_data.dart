class AppMockData {
  // --- App shell / demo copy (not user state) ---
  static const appBrandName = 'Morocco Experiences';
  static const appTagline = 'Authentic activities, one trusted place';
  static const supportEmail = 'support@morocco-experiences.app';
  static const supportPhonePlaceholder = '+212 5XX XX XX XX';
  static const settingsVersionSuffix = 'v1.0.0 (MVP)';
  static String get settingsVersionLabel => '$appBrandName $settingsVersionSuffix';

  /// Explore filter chips (labels used in category filter UI).
  static const exploreFilterCategories = <String>[
    'Culture',
    'Adventure',
    'Food',
    'Desert',
    'Nature',
  ];

  /// Category label per catalog experience id (Explore cards / filters).
  static const exploreCategoryByExperienceId = <String, String>{
    'agafay-quad': 'Adventure',
    'atlas-hike': 'Nature',
    'taghazout-surf': 'Adventure',
    'medina-food-stories': 'Food',
    'marrakech-rooftop-dinner': 'Food',
    'agafay-camp-evening': 'Desert',
    'merzouga-camel-ride': 'Desert',
    'fes-cooking-class': 'Culture',
    'essaouira-ocean-grill': 'Food',
  };

  /// Booking wizard: fake date row + pre-filled traveler fields for demos.
  static const bookingDemoDateOptions = <String>[
    'Fri, Mar 27',
    'Sat, Mar 28',
    'Sun, Mar 29',
    'Mon, Mar 30',
  ];
  static const bookingDefaultDate = 'Sat, Mar 28';
  static const bookingDefaultSlot = '10:30';
  static const bookingDemoTravelerName = 'Othmane A.';
  static const bookingDemoTravelerPhone = '+212 6XX XX XX XX';
  static const bookingDemoTravelerEmail = 'traveler@example.com';

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

  static const featuredExperiences = <Map<String, dynamic>>[
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

  static const curatedBySection = <String, List<Map<String, dynamic>>>{
    'Best in Marrakech': [
      {
        'id': 'medina-food-stories',
        'title': 'Medina Food & Stories',
        'city': 'Marrakech',
        'duration': '3 hours',
        'priceFromMad': 550,
        'verified': true,
        'rating': 4.8,
        'section': 'Best in Marrakech',
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
        'section': 'Best in Marrakech',
        'image': 'assets/images/home/curated_marrakech_rooftop.jpg',
      },
    ],
    'Desert escapes': [
      {
        'id': 'agafay-camp-evening',
        'title': 'Agafay Camp Evening',
        'city': 'Agafay',
        'duration': '6 hours',
        'priceFromMad': 780,
        'verified': true,
        'rating': 4.8,
        'section': 'Desert escapes',
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
        'section': 'Desert escapes',
        'image': 'assets/images/home/curated_desert_camel.jpg',
      },
    ],
    'Authentic food': [
      {
        'id': 'fes-cooking-class',
        'title': 'Cooking Class in Riad',
        'city': 'Fes',
        'duration': '3.5 hours',
        'priceFromMad': 460,
        'verified': true,
        'rating': 4.7,
        'section': 'Authentic food',
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
        'section': 'Authentic food',
        'image': 'assets/images/home/curated_food_ocean.jpg',
      },
    ],
  };

  static const experienceDetails = <String, Map<String, dynamic>>{
    'agafay-quad': {
      'id': 'agafay-quad',
      'title': 'Agafay Sunset Quad Ride',
      'city': 'Marrakech',
      'summary':
          'Fast-paced desert adventure for travelers who want action, sunsets, and easy logistics from Marrakech.',
      'priceFromMad': 450,
      'startingPriceType': 'per_person',
      'rating': 4.8,
      'reviewsCount': 132,
      'verified': true,
      'duration': '2 hours',
      'groupSize': 'Up to 8 people',
      'languages': 'EN / FR / AR',
      'meetingPoint': 'Pickup in Gueliz or Medina',
      'meetingNote': 'Exact pickup pin is shared after booking confirmation.',
      'responseTime': 'Replies in 30 min',
      'cancellation': 'Free cancellation up to 24h before start',
      'trustBadge': 'Verified local operator',
      'activityType': 'RESOURCE_BASED',
      'bookingMode': 'INSTANT',
      'confirmationType': 'INSTANT',
      'cancellationType': 'FLEXIBLE_24H',
      'depositRequired': true,
      'depositMad': 120,
      'availableSlots': ['09:00', '14:30', '17:00'],
      'heroImage': 'assets/images/home/exp_agafay_quad.jpg',
      'gallery': [
        'assets/images/home/exp_agafay_quad.jpg',
        'assets/images/home/action_desert.jpg',
        'assets/images/home/home_hero.jpg',
      ],
      'highlights': [
        'Golden-hour ride across the Agafay plateau',
        'Safety briefing and quality helmets included',
        'Photo stop with panoramic mountain views',
      ],
      'includes': [
        'Round-trip transport in Marrakech',
        'Quad bike and fuel',
        'Bottled water',
        'Local guide',
      ],
    },
    'atlas-hike': {
      'id': 'atlas-hike',
      'title': 'Atlas Day Hike — Berber Villages',
      'city': 'Marrakech',
      'summary':
          'Full-day mountain immersion with village stops, tea with locals, and guided pacing for moderate hikers.',
      'priceFromMad': 850,
      'startingPriceType': 'per_person',
      'rating': 4.9,
      'reviewsCount': 88,
      'verified': true,
      'duration': '8 hours',
      'groupSize': 'Up to 10 people',
      'languages': 'EN / FR',
      'meetingPoint': 'Hotel pickup from Marrakech',
      'meetingNote': 'Pickup window and driver contact are shared one day before.',
      'responseTime': 'Replies in 1 hour',
      'cancellation': 'Free cancellation up to 48h before start',
      'trustBadge': 'Top rated mountain guide',
      'activityType': 'MULTI_DAY',
      'bookingMode': 'REQUEST',
      'confirmationType': 'HOST_APPROVAL',
      'cancellationType': 'FLEXIBLE_48H',
      'depositRequired': true,
      'depositMad': 250,
      'durationOptionsDays': [1, 2, 3],
      'heroImage': 'assets/images/home/exp_atlas_hike.jpg',
      'gallery': [
        'assets/images/home/exp_atlas_hike.jpg',
        'assets/images/home/city_marrakech.jpg',
      ],
      'highlights': [
        'Scenic mountain trail with village viewpoints',
        'Authentic tea stop with local hosts',
        'Comfortable pace for moderate hikers',
      ],
      'includes': [
        'Guide and route planning',
        'Lunch in local guesthouse',
        'Transport from Marrakech',
      ],
    },
    'taghazout-surf': {
      'id': 'taghazout-surf',
      'title': 'Taghazout Surf Lesson',
      'city': 'Taghazout',
      'summary':
          'Beginner-friendly surf coaching with premium gear and a tide window chosen for your level.',
      'priceFromMad': 350,
      'startingPriceType': 'per_person',
      'rating': 4.7,
      'reviewsCount': 64,
      'verified': false,
      'duration': '2 hours',
      'groupSize': 'Up to 6 people',
      'languages': 'EN / FR',
      'meetingPoint': 'Taghazout main beach',
      'meetingNote': 'The exact meeting marker and instructor contact are sent after booking.',
      'responseTime': 'Replies in 2 hours',
      'cancellation': 'Free cancellation up to 24h before start',
      'trustBadge': 'Popular with first-time surfers',
      'activityType': 'FIXED_SLOT',
      'bookingMode': 'INSTANT',
      'confirmationType': 'INSTANT',
      'cancellationType': 'FLEXIBLE_24H',
      'depositRequired': false,
      'depositMad': 0,
      'availableSlots': ['08:00', '10:30', '16:00'],
      'heroImage': 'assets/images/home/exp_taghazout_surf.jpg',
      'gallery': [
        'assets/images/home/exp_taghazout_surf.jpg',
        'assets/images/home/city_taghazout.jpg',
      ],
      'highlights': [
        'Beginner-friendly lesson with personal coaching',
        'Best tide window selected by instructor',
        'Memorable ocean sunset session',
      ],
      'includes': [
        'Board and wetsuit',
        'Warm-up and safety briefing',
        'On-beach coaching',
      ],
    },
  };

  static List<Map<String, dynamic>> seedTrips() {
    return [
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
  }
}
