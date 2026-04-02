// ═══════════════════════════════════════════════════════════
// Alert Models — matching Alert-service controller responses
// All 8 alert types have their own typed model.
// ═══════════════════════════════════════════════════════════

import 'breeding.dart';

// ───────────────── Base Alert Response ─────────────────

class AlertResponse<T> {
  final int count;
  final List<T> data;

  const AlertResponse({required this.count, required this.data});

  factory AlertResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    return AlertResponse(
      count: json['count'] as int? ?? 0,
      data: (json['data'] as List<dynamic>?)
              ?.map((e) => fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

// ───────────────── Heat Alert ─────────────────

class HeatAlert {
  final String id;
  final String? name;
  final String? tagNumber;
  final String? animalNumber;
  final int? parity;
  final String? photoUrl;
  final DateTime? lastHeatDate;
  final int? daysSinceLastHeat;

  const HeatAlert({
    required this.id,
    this.name,
    this.tagNumber,
    this.animalNumber,
    this.parity,
    this.photoUrl,
    this.lastHeatDate,
    this.daysSinceLastHeat,
  });

  String get displayName => name ?? tagNumber ?? animalNumber ?? 'Unknown';

  factory HeatAlert.fromJson(Map<String, dynamic> json) {
    return HeatAlert(
      id: json['id'] as String,
      name: json['name'] as String?,
      tagNumber: json['tagNumber'] as String?,
      animalNumber: json['animalNumber'] as String?,
      parity: json['parity'] as int?,
      photoUrl: json['photoUrl'] as String?,
      lastHeatDate: json['lastHeatDate'] != null
          ? DateTime.parse(json['lastHeatDate'] as String)
          : null,
      daysSinceLastHeat: json['daysSinceLastHeat'] as int?,
    );
  }
}

// ───────────────── Pregnancy Check Alert ─────────────────

class PregnancyCheckAlert {
  final String journeyId;
  final AnimalSummary? animal;
  final DateTime conceiveDate;
  final String pregnancyType;
  final String? bullName;
  final int? parity;
  final int daysSinceConception;

  const PregnancyCheckAlert({
    required this.journeyId,
    this.animal,
    required this.conceiveDate,
    required this.pregnancyType,
    this.bullName,
    this.parity,
    required this.daysSinceConception,
  });

  factory PregnancyCheckAlert.fromJson(Map<String, dynamic> json) {
    return PregnancyCheckAlert(
      journeyId: json['journeyId'] as String,
      animal: json['animal'] != null
          ? AnimalSummary.fromJson(json['animal'] as Map<String, dynamic>)
          : null,
      conceiveDate: DateTime.parse(json['conceiveDate'] as String),
      pregnancyType: json['pregnancyType'] as String? ?? 'NATURAL',
      bullName: json['bullName'] as String?,
      parity: json['parity'] as int?,
      daysSinceConception: json['daysSinceConception'] as int? ?? 0,
    );
  }
}

// ───────────────── Insemination Alert ─────────────────

class InseminationAlert {
  final String id;
  final String? name;
  final String? tagNumber;
  final String? animalNumber;
  final int? parity;
  final String? photoUrl;
  final DateTime? lastDeliveryDate;
  final int? daysSinceDelivery;

  const InseminationAlert({
    required this.id,
    this.name,
    this.tagNumber,
    this.animalNumber,
    this.parity,
    this.photoUrl,
    this.lastDeliveryDate,
    this.daysSinceDelivery,
  });

  String get displayName => name ?? tagNumber ?? animalNumber ?? 'Unknown';

  factory InseminationAlert.fromJson(Map<String, dynamic> json) {
    return InseminationAlert(
      id: json['id'] as String,
      name: json['name'] as String?,
      tagNumber: json['tagNumber'] as String?,
      animalNumber: json['animalNumber'] as String?,
      parity: json['parity'] as int?,
      photoUrl: json['photoUrl'] as String?,
      lastDeliveryDate: json['lastDeliveryDate'] != null
          ? DateTime.parse(json['lastDeliveryDate'] as String)
          : null,
      daysSinceDelivery: json['daysSinceDelivery'] as int?,
    );
  }
}

// ───────────────── Delivery Alert ─────────────────

class DeliveryAlert {
  final String journeyId;
  final AnimalSummary? animal;
  final DateTime conceiveDate;
  final DateTime expectedDeliveryDate;
  final int daysRemaining;
  final String currentStage;
  final String pregnancyType;
  final String? bullName;
  final int? parity;
  final DateTime? dryOffDate;

  const DeliveryAlert({
    required this.journeyId,
    this.animal,
    required this.conceiveDate,
    required this.expectedDeliveryDate,
    required this.daysRemaining,
    required this.currentStage,
    required this.pregnancyType,
    this.bullName,
    this.parity,
    this.dryOffDate,
  });

  factory DeliveryAlert.fromJson(Map<String, dynamic> json) {
    return DeliveryAlert(
      journeyId: json['journeyId'] as String,
      animal: json['animal'] != null
          ? AnimalSummary.fromJson(json['animal'] as Map<String, dynamic>)
          : null,
      conceiveDate: DateTime.parse(json['conceiveDate'] as String),
      expectedDeliveryDate: DateTime.parse(json['expectedDeliveryDate'] as String),
      daysRemaining: json['daysRemaining'] as int? ?? 0,
      currentStage: json['currentStage'] as String? ?? 'INITIATED',
      pregnancyType: json['pregnancyType'] as String? ?? 'NATURAL',
      bullName: json['bullName'] as String?,
      parity: json['parity'] as int?,
      dryOffDate: json['dryOffDate'] != null
          ? DateTime.parse(json['dryOffDate'] as String)
          : null,
    );
  }
}

// ───────────────── Deworming Alert ─────────────────

class DewormingAlert {
  final String id;
  final AnimalSummary? animal;
  final DateTime lastDoseDate;
  final DateTime? nextDoseDate;
  final int? daysUntilDue;
  final bool isOverdue;
  final String? doseType;
  final String? companyName;

  const DewormingAlert({
    required this.id,
    this.animal,
    required this.lastDoseDate,
    this.nextDoseDate,
    this.daysUntilDue,
    this.isOverdue = false,
    this.doseType,
    this.companyName,
  });

  factory DewormingAlert.fromJson(Map<String, dynamic> json) {
    return DewormingAlert(
      id: json['id'] as String,
      animal: json['animal'] != null
          ? AnimalSummary.fromJson(json['animal'] as Map<String, dynamic>)
          : null,
      lastDoseDate: DateTime.parse(json['lastDoseDate'] as String),
      nextDoseDate: json['nextDoseDate'] != null
          ? DateTime.parse(json['nextDoseDate'] as String)
          : null,
      daysUntilDue: json['daysUntilDue'] as int?,
      isOverdue: json['isOverdue'] as bool? ?? false,
      doseType: json['doseType'] as String?,
      companyName: json['companyName'] as String?,
    );
  }
}

// ───────────────── Adult Alert ─────────────────

class AdultAlert {
  final String id;
  final String? name;
  final String? tagNumber;
  final String? animalNumber;
  final String? gender;
  final DateTime? birthDate;
  final DateTime? adultDate;
  final String? photoUrl;
  final int? ageInMonths;

  const AdultAlert({
    required this.id,
    this.name,
    this.tagNumber,
    this.animalNumber,
    this.gender,
    this.birthDate,
    this.adultDate,
    this.photoUrl,
    this.ageInMonths,
  });

  String get displayName => name ?? tagNumber ?? animalNumber ?? 'Unknown';

  factory AdultAlert.fromJson(Map<String, dynamic> json) {
    return AdultAlert(
      id: json['id'] as String,
      name: json['name'] as String?,
      tagNumber: json['tagNumber'] as String?,
      animalNumber: json['animalNumber'] as String?,
      gender: json['gender'] as String?,
      birthDate: json['birthDate'] != null
          ? DateTime.parse(json['birthDate'] as String)
          : null,
      adultDate: json['adultDate'] != null
          ? DateTime.parse(json['adultDate'] as String)
          : null,
      photoUrl: json['photoUrl'] as String?,
      ageInMonths: json['ageInMonths'] as int?,
    );
  }
}

// ───────────────── Lab Alert ─────────────────

class LabAlert {
  final String id;
  final AnimalSummary? animal;
  final String testName;
  final DateTime sampleDate;
  final String? remark;

  const LabAlert({
    required this.id,
    this.animal,
    required this.testName,
    required this.sampleDate,
    this.remark,
  });

  factory LabAlert.fromJson(Map<String, dynamic> json) {
    return LabAlert(
      id: json['id'] as String,
      animal: json['animal'] != null
          ? AnimalSummary.fromJson(json['animal'] as Map<String, dynamic>)
          : null,
      testName: json['testName'] as String? ?? 'Unknown Test',
      sampleDate: DateTime.parse(json['sampleDate'] as String),
      remark: json['remark'] as String?,
    );
  }
}

// ───────────────── Vaccination Alert ─────────────────

class VaccinationAlert {
  final AnimalSummary? animal;
  final String vaccineName;
  final String vaccineId;
  final DateTime? lastDoseDate;
  final DateTime? nextDueDate;
  final int? daysUntilDue;
  final bool isOverdue;
  final bool isNeverVaccinated;

  const VaccinationAlert({
    this.animal,
    required this.vaccineName,
    required this.vaccineId,
    this.lastDoseDate,
    this.nextDueDate,
    this.daysUntilDue,
    this.isOverdue = false,
    this.isNeverVaccinated = false,
  });

  factory VaccinationAlert.fromJson(Map<String, dynamic> json) {
    return VaccinationAlert(
      animal: json['animal'] != null
          ? AnimalSummary.fromJson(json['animal'] as Map<String, dynamic>)
          : null,
      vaccineName: json['vaccineName'] as String? ?? 'Unknown',
      vaccineId: json['vaccineId'] as String? ?? '',
      lastDoseDate: json['lastDoseDate'] != null
          ? DateTime.parse(json['lastDoseDate'] as String)
          : null,
      nextDueDate: json['nextDueDate'] != null
          ? DateTime.parse(json['nextDueDate'] as String)
          : null,
      daysUntilDue: json['daysUntilDue'] as int?,
      isOverdue: json['isOverdue'] as bool? ?? false,
      isNeverVaccinated: json['isNeverVaccinated'] as bool? ?? false,
    );
  }
}
