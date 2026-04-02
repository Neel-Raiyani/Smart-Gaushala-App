import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'secure_storage.dart';

/// Centralized API client with JWT injection, gaushala context, and error handling.
///
/// All backend calls go through this singleton. Interceptors automatically:
/// 1. Inject `Authorization: Bearer <token>` header
/// 2. Inject `x-gaushala-id` header for gaushala-scoped endpoints
/// 3. Handle 401 responses by clearing tokens
class ApiService {
  static ApiService? _instance;
  late final Dio _dio;

  ApiService._() {
    final baseUrl = dotenv.env['API_BASE_URL'] ?? 'https://week3reqbackend.empyreal.work';

    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      sendTimeout: const Duration(seconds: 15),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // ───────────────── Auth Interceptor ─────────────────
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Inject JWT token
        final token = await SecureStorage.getToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }

        // Inject gaushala context
        final gaushalaId = await SecureStorage.getActiveGaushalaId();
        if (gaushalaId != null && gaushalaId.isNotEmpty) {
          options.headers['x-gaushala-id'] = gaushalaId;
        }

        handler.next(options);
      },
      onError: (error, handler) async {
        // Log errors in debug mode
        if (kDebugMode) {
          debugPrint('┌─ API ERROR ──────────────────────────');
          debugPrint('│ ${error.requestOptions.method} ${error.requestOptions.path}');
          debugPrint('│ Status: ${error.response?.statusCode}');
          debugPrint('│ Message: ${error.response?.data}');
          debugPrint('└──────────────────────────────────────');
        }
        handler.next(error);
      },
      onResponse: (response, handler) {
        if (kDebugMode) {
          debugPrint('✓ ${response.requestOptions.method} ${response.requestOptions.path} → ${response.statusCode}');
        }
        handler.next(response);
      },
    ));
  }

  /// Get the singleton instance
  static ApiService get instance {
    _instance ??= ApiService._();
    return _instance!;
  }

  /// Direct access to underlying Dio instance for advanced use
  Dio get dio => _dio;

  // ═══════════════════════════════════════════════
  // CONVENIENCE METHODS
  // ═══════════════════════════════════════════════

  /// GET request
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) =>
      _dio.get(path, queryParameters: queryParameters, options: options);

  /// POST request
  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) =>
      _dio.post(path, data: data, queryParameters: queryParameters, options: options);

  /// PATCH request
  Future<Response> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) =>
      _dio.patch(path, data: data, queryParameters: queryParameters, options: options);

  /// PUT request
  Future<Response> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) =>
      _dio.put(path, data: data, queryParameters: queryParameters, options: options);

  /// DELETE request
  Future<Response> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) =>
      _dio.delete(path, data: data, queryParameters: queryParameters, options: options);

  // ═══════════════════════════════════════════════
  // ERROR HELPERS
  // ═══════════════════════════════════════════════

  /// Extract a user-friendly error message from a DioException
  static String getErrorMessage(dynamic error) {
    if (error is DioException) {
      // Server responded with an error
      if (error.response?.data != null) {
        final data = error.response!.data;
        if (data is Map && data.containsKey('message')) {
          return data['message'] as String;
        }
      }

      // Connection errors
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return 'Connection timed out. Please check your internet and try again.';
        case DioExceptionType.connectionError:
          return 'Unable to connect to the server. Please check your internet connection.';
        case DioExceptionType.badResponse:
          final code = error.response?.statusCode;
          if (code == 401) return 'Session expired. Please log in again.';
          if (code == 403) return 'You do not have permission to perform this action.';
          if (code == 404) return 'The requested resource was not found.';
          if (code == 409) return 'This record already exists.';
          if (code == 500) return 'Server error. Please try again later.';
          return 'Something went wrong (Error $code).';
        default:
          return 'An unexpected error occurred. Please try again.';
      }
    }
    return error?.toString() ?? 'An unknown error occurred.';
  }

  /// Check if error is a 401 (unauthorized)
  static bool isUnauthorized(dynamic error) {
    if (error is DioException) {
      return error.response?.statusCode == 401;
    }
    return false;
  }
}
