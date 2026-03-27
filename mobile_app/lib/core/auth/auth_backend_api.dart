import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:dio/dio.dart';

import '../config/app_env.dart';

class AuthBackendApi {
  static Dio _dio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: AppEnv.apiBaseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
      ),
    );
    final token = BetterAuth.instance.client.session?.token;
    if (token != null && token.isNotEmpty) {
      dio.options.headers['Authorization'] = 'Bearer $token';
    }
    return dio;
  }

  static Future<bool> hasServerSession() async {
    final res = await _dio().get('/v1/auth/session');
    final body = res.data;
    if (body is! Map<String, dynamic>) return false;
    return body['authenticated'] == true;
  }

  static Future<void> logoutAll() async {
    await _dio().post('/v1/auth/logout-all');
  }
}
