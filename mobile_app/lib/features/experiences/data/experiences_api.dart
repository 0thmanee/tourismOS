import 'package:dio/dio.dart';

class ExperiencesApi {
  ExperiencesApi(this._dio);

  final Dio _dio;

  Future<List<Map<String, dynamic>>> listFeatured({
    String? city,
    String? category,
  }) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/experiences',
      queryParameters: {
        if (city != null && city.isNotEmpty) 'city': city,
        if (category != null && category.isNotEmpty) 'category': category,
        'featured': '1',
      },
    );
    final items = response.data?['items'];
    if (items is List) {
      return items.whereType<Map<String, dynamic>>().toList();
    }
    return const [];
  }
}
