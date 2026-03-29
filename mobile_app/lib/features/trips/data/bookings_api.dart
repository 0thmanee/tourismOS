import 'package:dio/dio.dart';

/// B2C booking + trips (`/api/v1/bookings`, `/api/v1/trips`).
class BookingsApi {
  BookingsApi(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>> createBooking(Map<String, dynamic> body) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/v1/bookings',
      data: body,
    );
    return response.data ?? <String, dynamic>{};
  }

  Future<List<Map<String, dynamic>>> listTrips({
    String? phone,
    String status = 'all',
  }) async {
    final query = <String, dynamic>{'status': status};
    if (phone != null && phone.isNotEmpty) {
      query['phone'] = phone;
    }
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/trips',
      queryParameters: query,
    );
    final items = response.data?['items'];
    if (items is! List) return const [];
    final out = <Map<String, dynamic>>[];
    for (final e in items) {
      if (e is Map<String, dynamic>) {
        out.add(e);
      } else if (e is Map) {
        out.add(Map<String, dynamic>.from(e));
      }
    }
    return out;
  }

  Future<Map<String, dynamic>> fetchTrip({
    required String bookingId,
    String? phone,
  }) async {
    final query = <String, dynamic>{};
    if (phone != null && phone.isNotEmpty) {
      query['phone'] = phone;
    }
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/trips/$bookingId',
      queryParameters: query,
    );
    final item = response.data?['item'];
    if (item is! Map<String, dynamic>) {
      throw StateError('Invalid trip response');
    }
    return item;
  }

  Future<List<Map<String, dynamic>>> listBookingMessages({
    required String bookingId,
    String? phone,
  }) async {
    final query = <String, dynamic>{};
    if (phone != null && phone.isNotEmpty) {
      query['phone'] = phone;
    }
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/bookings/$bookingId/messages',
      queryParameters: query,
    );
    final items = response.data?['items'];
    if (items is! List) return const [];
    final out = <Map<String, dynamic>>[];
    for (final e in items) {
      if (e is Map<String, dynamic>) {
        out.add(e);
      } else if (e is Map) {
        out.add(Map<String, dynamic>.from(e));
      }
    }
    return out;
  }

  Future<Map<String, dynamic>> postBookingMessage({
    required String bookingId,
    String? phone,
    required String body,
  }) async {
    final query = <String, dynamic>{};
    if (phone != null && phone.isNotEmpty) {
      query['phone'] = phone;
    }
    final response = await _dio.post<Map<String, dynamic>>(
      '/v1/bookings/$bookingId/messages',
      queryParameters: query,
      data: {'body': body},
    );
    final item = response.data?['item'];
    if (item is! Map<String, dynamic>) {
      throw StateError('Invalid message response');
    }
    return item;
  }
}
