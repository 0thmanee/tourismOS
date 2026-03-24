import 'package:dio/dio.dart';

class ExperiencesApi {
  ExperiencesApi(this._dio);

  final Dio _dio;

  Future<List<Map<String, dynamic>>> listFeatured({
    String? city,
    String? category,
  }) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/experiences',
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

  /// Full JSON body (`items` + `meta`) for marketplace bootstrap.
  Future<Map<String, dynamic>> listExperiencesResponse({
    int page = 1,
    int pageSize = 48,
    String? city,
    String? category,
    String? sort,
    bool featured = false,
  }) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/experiences',
      queryParameters: {
        'page': page,
        'pageSize': pageSize,
        if (city != null && city.isNotEmpty) 'city': city,
        if (category != null && category.isNotEmpty) 'category': category,
        if (sort != null && sort.isNotEmpty) 'sort': sort,
        if (featured) 'featured': '1',
      },
    );
    return response.data ?? <String, dynamic>{};
  }

  Future<Map<String, dynamic>> fetchExperienceItem(String id) async {
    final response =
        await _dio.get<Map<String, dynamic>>('/v1/experiences/$id');
    final item = response.data?['item'];
    if (item is! Map<String, dynamic>) {
      throw StateError('Invalid experience response');
    }
    return item;
  }
}
