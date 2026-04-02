import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';

// ═══════════════════════════════════════════════════════════
// Core Providers — Foundation for all feature providers
// ═══════════════════════════════════════════════════════════

/// Provides the singleton ApiService instance
final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService.instance;
});
