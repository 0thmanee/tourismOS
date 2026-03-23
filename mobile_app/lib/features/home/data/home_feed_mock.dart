import '../../../core/data/app_mock_data.dart';

/// Placeholder catalog until `GET /api/experiences` is live.
class HomeFeedMock {
  static const hero = AppMockData.hero;
  static const categories = AppMockData.categories;
  static const cities = AppMockData.cities;
  static const quickActions = AppMockData.quickActions;

  static List<Map<String, dynamic>> featuredFallback() {
    return AppMockData.featuredExperiences.map((e) => {...e}).toList();
  }

  /// Curated horizontal rows — all mocked.
  static List<Map<String, dynamic>> curated(String sectionTitle) {
    final section = AppMockData.curatedBySection[sectionTitle] ??
        AppMockData.curatedBySection['Authentic food']!;
    return section.map((e) => {...e}).toList();
  }
}
