import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Centralized secure storage for auth tokens and gaushala context.
/// Uses platform-specific encrypted storage (Keychain on iOS, EncryptedSharedPrefs on Android).
class SecureStorage {
  static const _instance = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  // ───────────────── Keys ─────────────────
  static const _tokenKey = 'auth_token';
  static const _gaushalaIdKey = 'active_gaushala_id';
  static const _gaushalaNameKey = 'active_gaushala_name';
  static const _userIdKey = 'user_id';
  static const _userNameKey = 'user_name';

  // ───────────────── Token ─────────────────
  static Future<void> saveToken(String token) =>
      _instance.write(key: _tokenKey, value: token);

  static Future<String?> getToken() =>
      _instance.read(key: _tokenKey);

  static Future<void> deleteToken() =>
      _instance.delete(key: _tokenKey);

  // ───────────────── Active Gaushala ─────────────────
  static Future<void> saveActiveGaushala(String id, String name) async {
    await _instance.write(key: _gaushalaIdKey, value: id);
    await _instance.write(key: _gaushalaNameKey, value: name);
  }

  static Future<String?> getActiveGaushalaId() =>
      _instance.read(key: _gaushalaIdKey);

  static Future<String?> getActiveGaushalaName() =>
      _instance.read(key: _gaushalaNameKey);

  // ───────────────── User Info ─────────────────
  static Future<void> saveUserInfo(String id, String name) async {
    await _instance.write(key: _userIdKey, value: id);
    await _instance.write(key: _userNameKey, value: name);
  }

  static Future<String?> getUserId() =>
      _instance.read(key: _userIdKey);

  static Future<String?> getUserName() =>
      _instance.read(key: _userNameKey);

  // ───────────────── Clear All ─────────────────
  static Future<void> clearAll() => _instance.deleteAll();
}
