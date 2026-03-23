import '../../../core/data/app_mock_data.dart';

class ExperienceDetailMock {
  static final Map<String, Map<String, dynamic>> byId =
      AppMockData.experienceDetails.map(
    (key, value) => MapEntry(key, {...value}),
  );

  static Map<String, dynamic> get(String id) {
    return byId[id] ?? byId['agafay-quad']!;
  }
}
