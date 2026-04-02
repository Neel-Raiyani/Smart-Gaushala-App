import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/services/api_service.dart';
import '../../core/services/secure_storage.dart';
import '../../core/models/user.dart';
import '../services/auth_service.dart';

// ═══════════════════════════════════════════════════════════
// Auth State
// ═══════════════════════════════════════════════════════════

enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthState {
  final AuthStatus status;
  final String? token;
  final List<GaushalaInfo> gaushalas;
  final GaushalaInfo? activeGaushala;
  final String? userName;
  final String? errorMessage;

  const AuthState({
    this.status = AuthStatus.initial,
    this.token,
    this.gaushalas = const [],
    this.activeGaushala,
    this.userName,
    this.errorMessage,
  });

  AuthState copyWith({
    AuthStatus? status,
    String? token,
    List<GaushalaInfo>? gaushalas,
    GaushalaInfo? activeGaushala,
    String? userName,
    String? errorMessage,
  }) {
    return AuthState(
      status: status ?? this.status,
      token: token ?? this.token,
      gaushalas: gaushalas ?? this.gaushalas,
      activeGaushala: activeGaushala ?? this.activeGaushala,
      userName: userName ?? this.userName,
      errorMessage: errorMessage,
    );
  }

  bool get isAuthenticated => status == AuthStatus.authenticated;
  bool get isLoading => status == AuthStatus.loading;
  bool get hasMultipleGaushalas => gaushalas.length > 1;
}

// ═══════════════════════════════════════════════════════════
// Auth Notifier
// ═══════════════════════════════════════════════════════════

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _authRepo;

  AuthNotifier(this._authRepo) : super(const AuthState());

  /// Check for existing session on app start
  Future<void> checkExistingSession() async {
    final token = await SecureStorage.getToken();
    final gaushalaId = await SecureStorage.getActiveGaushalaId();
    final gaushalaName = await SecureStorage.getActiveGaushalaName();
    final userName = await SecureStorage.getUserName();

    if (token != null && token.isNotEmpty && gaushalaId != null) {
      state = state.copyWith(
        status: AuthStatus.authenticated,
        token: token,
        userName: userName,
        activeGaushala: GaushalaInfo(
          id: gaushalaId,
          name: gaushalaName ?? 'My Gaushala',
          role: 'OWNER',
        ),
      );
    } else {
      state = state.copyWith(status: AuthStatus.unauthenticated);
    }
  }

  /// Login
  Future<LoginResult> login(String mobileNumber, String password) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);

    try {
      final response = await _authRepo.login(mobileNumber, password);

      // Store token
      await SecureStorage.saveToken(response.token);

      state = state.copyWith(
        status: AuthStatus.authenticated,
        token: response.token,
        gaushalas: response.gaushalas,
      );

      // If single gaushala, auto-select it
      if (response.gaushalas.length == 1) {
        await selectGaushala(response.gaushalas.first);
        return LoginResult.success;
      }

      return LoginResult.needsGaushalaSelection;
    } catch (e) {
      final message = AuthRepository.getErrorMessage(e);
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: message,
      );
      return LoginResult.error;
    }
  }

  /// Register
  Future<String?> register({
    required String name,
    required String mobileNumber,
    required String password,
    required String confirmPassword,
    required String gaushalaName,
    required String city,
    int totalCattle = 0,
  }) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);

    try {
      await _authRepo.register(
        name: name,
        mobileNumber: mobileNumber,
        password: password,
        confirmPassword: confirmPassword,
        gaushalaName: gaushalaName,
        city: city,
        totalCattle: totalCattle,
      );

      state = state.copyWith(status: AuthStatus.unauthenticated);
      return null; // Success
    } catch (e) {
      final message = AuthRepository.getErrorMessage(e);
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: message,
      );
      return message;
    }
  }

  /// Select a gaushala from the list
  Future<void> selectGaushala(GaushalaInfo gaushala) async {
    await SecureStorage.saveActiveGaushala(gaushala.id, gaushala.name);
    state = state.copyWith(
      status: AuthStatus.authenticated,
      activeGaushala: gaushala,
    );
  }

  /// Logout
  Future<void> logout() async {
    await SecureStorage.clearAll();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(errorMessage: null);
  }
}

enum LoginResult { success, needsGaushalaSelection, error }

// ═══════════════════════════════════════════════════════════
// Providers
// ═══════════════════════════════════════════════════════════

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ApiService.instance);
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repo = ref.watch(authRepositoryProvider);
  return AuthNotifier(repo);
});
