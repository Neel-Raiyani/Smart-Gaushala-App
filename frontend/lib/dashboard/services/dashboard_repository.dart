import '../../core/services/api_service.dart';
import '../models/dashboard_summary.dart';

/// Repository for dashboard-related API calls.
class DashboardRepository {
  final ApiService _api;

  DashboardRepository(this._api);

  /// Fetch animal summary counts (cows + bulls breakdown).
  /// Maps to: GET /api/animal/reports/summary
  Future<DashboardSummary> getAnimalSummary() async {
    final response = await _api.get('/api/animal/reports/summary');
    final data = response.data as Map<String, dynamic>;
    return DashboardSummary.fromJson(data);
  }
}
