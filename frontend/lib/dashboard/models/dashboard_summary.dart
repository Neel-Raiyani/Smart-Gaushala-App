/// Dashboard summary model matching Animal-service's
/// GET /api/animal/reports/summary response.
class DashboardSummary {
  final CowSummary cows;
  final BullSummary bulls;

  const DashboardSummary({required this.cows, required this.bulls});

  int get totalAnimals => cows.total + bulls.total;

  factory DashboardSummary.fromJson(Map<String, dynamic> json) {
    final summary = json['summary'] as Map<String, dynamic>? ?? json;
    return DashboardSummary(
      cows: CowSummary.fromJson(summary['cows'] as Map<String, dynamic>? ?? {}),
      bulls: BullSummary.fromJson(summary['bulls'] as Map<String, dynamic>? ?? {}),
    );
  }

  /// Empty state for initial/error fallback
  static const empty = DashboardSummary(
    cows: CowSummary(total: 0, heifer: 0, pregnant: 0, lactating: 0, dryOff: 0, retired: 0),
    bulls: BullSummary(total: 0, calf: 0, retired: 0),
  );
}

class CowSummary {
  final int total;
  final int heifer;
  final int pregnant;
  final int lactating;
  final int dryOff;
  final int retired;

  const CowSummary({
    required this.total,
    required this.heifer,
    required this.pregnant,
    required this.lactating,
    required this.dryOff,
    required this.retired,
  });

  factory CowSummary.fromJson(Map<String, dynamic> json) {
    return CowSummary(
      total: json['total'] as int? ?? 0,
      heifer: json['heifer'] as int? ?? 0,
      pregnant: json['pregnant'] as int? ?? 0,
      lactating: json['lactating'] as int? ?? 0,
      dryOff: json['dryOff'] as int? ?? 0,
      retired: json['retired'] as int? ?? 0,
    );
  }
}

class BullSummary {
  final int total;
  final int calf;
  final int retired;

  const BullSummary({
    required this.total,
    required this.calf,
    required this.retired,
  });

  factory BullSummary.fromJson(Map<String, dynamic> json) {
    return BullSummary(
      total: json['total'] as int? ?? 0,
      calf: json['calf'] as int? ?? 0,
      retired: json['retired'] as int? ?? 0,
    );
  }
}
