import '../../core/services/api_service.dart';
import '../../core/models/user.dart';

/// Repository for all Auth-service API calls.
/// Maps to: POST /api/auth/login, /register, /forgot-password/*, /profile
class AuthRepository {
  final ApiService _api;

  AuthRepository(this._api);

  /// Login with mobile + password → returns token + gaushalas list
  Future<LoginResponse> login(String mobileNumber, String password) async {
    final response = await _api.post('/api/auth/login', data: {
      'mobileNumber': mobileNumber,
      'password': password,
    });

    final data = response.data as Map<String, dynamic>;
    return LoginResponse.fromJson(data);
  }

  /// Register new user + gaushala
  Future<void> register({
    required String name,
    required String mobileNumber,
    required String password,
    required String confirmPassword,
    required String gaushalaName,
    required String city,
    int totalCattle = 0,
  }) async {
    await _api.post('/api/auth/register', data: {
      'name': name,
      'mobileNumber': mobileNumber,
      'password': password,
      'confirmPassword': confirmPassword,
      'gaushalaName': gaushalaName,
      'city': city,
      'totalCattle': totalCattle,
    });
  }

  /// Get current user profile
  Future<User> getProfile() async {
    final response = await _api.get('/api/auth/profile');
    final data = response.data as Map<String, dynamic>;
    return User.fromJson(data['data'] ?? data);
  }

  /// Send OTP for forgot password
  Future<void> sendForgotPasswordOtp(String mobileNumber) async {
    await _api.post('/api/auth/forgot-password/send-otp', data: {
      'mobileNumber': mobileNumber,
    });
  }

  /// Verify OTP
  Future<String> verifyForgotPasswordOtp(String mobileNumber, String otp) async {
    final response = await _api.post('/api/auth/forgot-password/verify-otp', data: {
      'mobileNumber': mobileNumber,
      'otp': otp,
    });
    final data = response.data as Map<String, dynamic>;
    return data['resetToken'] as String? ?? '';
  }

  /// Reset password with token
  Future<void> resetPassword(String resetToken, String newPassword) async {
    await _api.post('/api/auth/forgot-password/reset', data: {
      'resetToken': resetToken,
      'password': newPassword,
    });
  }

  /// Change password (authenticated)
  Future<void> changePassword(String oldPassword, String newPassword) async {
    await _api.post('/api/auth/change-password', data: {
      'oldPassword': oldPassword,
      'newPassword': newPassword,
    });
  }

  /// Extract user-friendly error message
  static String getErrorMessage(dynamic error) {
    return ApiService.getErrorMessage(error);
  }

  /// Check if error is 401
  static bool isUnauthorized(dynamic error) {
    return ApiService.isUnauthorized(error);
  }
}
