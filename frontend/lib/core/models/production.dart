// ═══════════════════════════════════════════════════════════
// Production Models — matching Production-service Prisma schema
// ═══════════════════════════════════════════════════════════

// ───────────────── Enums ─────────────────

enum MilkSession { morning, evening }

// ───────────────── Milk Record ─────────────────

class MilkRecord {
  final String id;
  final String animalId;
  final String gaushalaId;
  final DateTime date;
  final String session; // MORNING, EVENING
  final double quantity; // Liters
  final double feedQuantity; // Kg
  final DateTime? createdAt;

  const MilkRecord({
    required this.id,
    required this.animalId,
    required this.gaushalaId,
    required this.date,
    required this.session,
    required this.quantity,
    required this.feedQuantity,
    this.createdAt,
  });

  factory MilkRecord.fromJson(Map<String, dynamic> json) {
    return MilkRecord(
      id: json['id'] as String,
      animalId: json['animalId'] as String,
      gaushalaId: json['gaushalaId'] as String? ?? '',
      date: DateTime.parse(json['date'] as String),
      session: json['session'] as String,
      quantity: _prodParseDouble(json['quantity']) ?? 0,
      feedQuantity: _prodParseDouble(json['feedQuantity']) ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
    );
  }
}

/// Entry for bulk yield submission
class MilkEntryInput {
  final String animalId;
  final double quantity;
  final double feedQuantity;

  const MilkEntryInput({
    required this.animalId,
    required this.quantity,
    required this.feedQuantity,
  });

  Map<String, dynamic> toJson() => {
        'animalId': animalId,
        'quantity': quantity,
        'feedQuantity': feedQuantity,
      };
}

// ───────────────── Milk Distribution ─────────────────

class MilkDistribution {
  final String id;
  final String gaushalaId;
  final String categoryId;
  final DateTime date;
  final double quantity;
  final String? notes;

  const MilkDistribution({
    required this.id,
    required this.gaushalaId,
    required this.categoryId,
    required this.date,
    required this.quantity,
    this.notes,
  });

  factory MilkDistribution.fromJson(Map<String, dynamic> json) {
    return MilkDistribution(
      id: json['id'] as String,
      gaushalaId: json['gaushalaId'] as String? ?? '',
      categoryId: json['categoryId'] as String,
      date: DateTime.parse(json['date'] as String),
      quantity: _prodParseDouble(json['quantity']) ?? 0,
      notes: json['notes'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'categoryId': categoryId,
        'date': date.toIso8601String(),
        'quantity': quantity,
        if (notes != null) 'notes': notes,
      };
}

// ───────────────── Distribution Category ─────────────────

class MilkDistributionCategory {
  final String id;
  final String name;
  final String gaushalaId;

  const MilkDistributionCategory({
    required this.id,
    required this.name,
    required this.gaushalaId,
  });

  factory MilkDistributionCategory.fromJson(Map<String, dynamic> json) {
    return MilkDistributionCategory(
      id: json['id'] as String,
      name: json['name'] as String,
      gaushalaId: json['gaushalaId'] as String? ?? '',
    );
  }
}

// ───────────────── Feed Inventory ─────────────────

class FeedInventory {
  final String id;
  final String gaushalaId;
  final double totalQuantity; // Kg

  const FeedInventory({
    required this.id,
    required this.gaushalaId,
    required this.totalQuantity,
  });

  factory FeedInventory.fromJson(Map<String, dynamic> json) {
    return FeedInventory(
      id: json['id'] as String,
      gaushalaId: json['gaushalaId'] as String? ?? '',
      totalQuantity: _prodParseDouble(json['totalQuantity']) ?? 0,
    );
  }
}

// ───────────────── Report Models ─────────────────

/// Daily milk report entry (per animal, per day)
class DailyMilkReportEntry {
  final String animalId;
  final double morning;
  final double evening;
  final double total;
  final double feed;

  const DailyMilkReportEntry({
    required this.animalId,
    required this.morning,
    required this.evening,
    required this.total,
    required this.feed,
  });

  factory DailyMilkReportEntry.fromJson(Map<String, dynamic> json) {
    return DailyMilkReportEntry(
      animalId: json['animalId'] as String,
      morning: _prodParseDouble(json['morning']) ?? 0,
      evening: _prodParseDouble(json['evening']) ?? 0,
      total: _prodParseDouble(json['total']) ?? 0,
      feed: _prodParseDouble(json['feed']) ?? 0,
    );
  }
}

/// Monthly aggregated entry (per day)
class MonthlyMilkEntry {
  final String date;
  final double totalMilk;
  final double totalFeed;
  final int count;

  const MonthlyMilkEntry({
    required this.date,
    required this.totalMilk,
    required this.totalFeed,
    required this.count,
  });

  factory MonthlyMilkEntry.fromJson(Map<String, dynamic> json) {
    return MonthlyMilkEntry(
      date: json['date'] as String,
      totalMilk: _prodParseDouble(json['totalMilk']) ?? 0,
      totalFeed: _prodParseDouble(json['totalFeed']) ?? 0,
      count: json['count'] as int? ?? 0,
    );
  }
}

/// Distribution summary entry
class DistributionSummaryEntry {
  final String categoryId;
  final String categoryName;
  final double totalQuantity;

  const DistributionSummaryEntry({
    required this.categoryId,
    required this.categoryName,
    required this.totalQuantity,
  });

  factory DistributionSummaryEntry.fromJson(Map<String, dynamic> json) {
    return DistributionSummaryEntry(
      categoryId: json['categoryId'] as String,
      categoryName: json['categoryName'] as String,
      totalQuantity: _prodParseDouble(json['totalQuantity']) ?? 0,
    );
  }
}

// ───────────────── Helpers ─────────────────

double? _prodParseDouble(dynamic value) {
  if (value == null) return null;
  if (value is double) return value;
  if (value is int) return value.toDouble();
  return double.tryParse(value.toString());
}
