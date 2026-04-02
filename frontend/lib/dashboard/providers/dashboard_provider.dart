import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/services/api_service.dart';
import '../models/dashboard_summary.dart';
import '../services/dashboard_repository.dart';

/// Repository provider
final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  return DashboardRepository(ApiService.instance);
});

/// Auto-fetching provider for the dashboard summary.
/// Call `ref.invalidate(dashboardSummaryProvider)` to force-refresh.
final dashboardSummaryProvider = FutureProvider.autoDispose<DashboardSummary>((ref) async {
  final repo = ref.watch(dashboardRepositoryProvider);
  return repo.getAnimalSummary();
});
