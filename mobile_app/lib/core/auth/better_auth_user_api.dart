import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../network/api_client.dart';

/// REST calls under `/api/auth/*` (Dio [baseUrl] is `.../api`).
class BetterAuthUserApi {
  BetterAuthUserApi(this._dio);

  final Dio _dio;

  Future<void> updateUser({String? name, String? image}) async {
    final body = <String, dynamic>{};
    if (name != null) body['name'] = name;
    if (image != null) body['image'] = image;
    await _dio.post<Map<String, dynamic>>('/auth/update-user', data: body);
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
    bool revokeOtherSessions = true,
  }) async {
    await _dio.post<Map<String, dynamic>>(
      '/auth/change-password',
      data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
        'revokeOtherSessions': revokeOtherSessions,
      },
    );
  }
}

String messageFromDio(Object e) {
  if (e is DioException) {
    final data = e.response?.data;
    if (data is Map && data['message'] != null) {
      return data['message'].toString();
    }
    return e.message ?? 'Request failed';
  }
  return e.toString();
}

final betterAuthUserApiProvider = Provider<BetterAuthUserApi>((ref) {
  return BetterAuthUserApi(ref.watch(dioProvider));
});
