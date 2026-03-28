import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/better_auth_sync.dart';
import '../config/app_env.dart';

const _kAuthRetryExtra = 'v1AuthRetried';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: AppEnv.apiBaseUrl,
      connectTimeout: const Duration(seconds: 20),
      receiveTimeout: const Duration(seconds: 20),
      headers: const {'Content-Type': 'application/json'},
    ),
  );
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) {
        final token = BetterAuth.instance.client.session?.token;
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ),
  );
  dio.interceptors.add(
    QueuedInterceptorsWrapper(
      onError: (err, handler) async {
        if (err.response?.statusCode != 401) {
          return handler.next(err);
        }
        final req = err.requestOptions;
        if (req.extra[_kAuthRetryExtra] == true) {
          return handler.next(err);
        }
        await refreshBetterAuthClientSession();
        final token = BetterAuth.instance.client.session?.token;
        if (token == null || token.isEmpty) {
          return handler.next(err);
        }
        req.headers['Authorization'] = 'Bearer $token';
        req.extra[_kAuthRetryExtra] = true;
        try {
          final response = await dio.fetch<Map<String, dynamic>>(req);
          return handler.resolve(response);
        } catch (e) {
          if (e is DioException) {
            return handler.next(e);
          }
          return handler.next(err);
        }
      },
    ),
  );
  return dio;
});
