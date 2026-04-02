// ═══════════════════════════════════════════════════════════
// Breeding Models — matching Breeding-service Prisma schema
// ═══════════════════════════════════════════════════════════

// ───────────────── Enums ─────────────────

enum JourneyStatus { initiated, pregnant, dryOff, completed, failed }

enum PregnancyType { natural, ai }

enum CalfStatus {
  aliveMale, aliveFemale,
  stillbornMale, stillbornFemale,
  twinBothAlive, twinOneAlive, twinBothDead,
  abortion
}

enum DryOffReason { preDelivery, lowProduction, health, other }

// ───────────────── Conception Journey ─────────────────

class ConceptionJourney {
  final String id;
  final String animalId;
  final String gaushalaId;
  final String status; // INITIATED, PREGNANT, DRY_OFF, COMPLETED, FAILED
  final int parity;
  final DateTime conceiveDate;
  final String pregnancyType; // NATURAL, AI
  final String? bullId;
  final String? bullName;
  final String? aiSerialNumber;
  final String? aiCompany;
  final DateTime? pdDate;
  final String? pdResult;
  final DateTime? dryOffDate;
  final DateTime? deliveryDate;
  final String? deliveryType;
  final String? calfStatus;
  final String? calfGender;
  final String? calfId;
  final String? deliveryPhotoUrl;
  final String? deliveryNotes;
  final DateTime? createdAt;

  // Joined data
  final AnimalSummary? animal;

  const ConceptionJourney({
    required this.id,
    required this.animalId,
    required this.gaushalaId,
    required this.status,
    required this.parity,
    required this.conceiveDate,
    required this.pregnancyType,
    this.bullId,
    this.bullName,
    this.aiSerialNumber,
    this.aiCompany,
    this.pdDate,
    this.pdResult,
    this.dryOffDate,
    this.deliveryDate,
    this.deliveryType,
    this.calfStatus,
    this.calfGender,
    this.calfId,
    this.deliveryPhotoUrl,
    this.deliveryNotes,
    this.createdAt,
    this.animal,
  });

  /// Current stage index (0-3) for stepper UI
  int get stageIndex {
    switch (status) {
      case 'INITIATED': return 0;
      case 'PREGNANT': return 1;
      case 'DRY_OFF': return 2;
      case 'COMPLETED': return 3;
      case 'FAILED': return -1;
      default: return 0;
    }
  }

  /// Expected delivery date (conceive + 280 days)
  DateTime get expectedDeliveryDate =>
      conceiveDate.add(const Duration(days: 280));

  /// Days remaining until expected delivery
  int get daysUntilDelivery =>
      expectedDeliveryDate.difference(DateTime.now()).inDays;

  /// Days since conception
  int get daysSinceConception =>
      DateTime.now().difference(conceiveDate).inDays;

  factory ConceptionJourney.fromJson(Map<String, dynamic> json) {
    return ConceptionJourney(
      id: json['id'] as String,
      animalId: json['animalId'] as String,
      gaushalaId: json['gaushalaId'] as String? ?? '',
      status: json['status'] as String? ?? 'INITIATED',
      parity: json['parity'] as int? ?? 0,
      conceiveDate: DateTime.parse(json['conceiveDate'] as String),
      pregnancyType: json['pregnancyType'] as String? ?? 'NATURAL',
      bullId: json['bullId'] as String?,
      bullName: json['bullName'] as String?,
      aiSerialNumber: json['aiSerialNumber'] as String?,
      aiCompany: json['aiCompany'] as String?,
      pdDate: json['pdDate'] != null ? DateTime.parse(json['pdDate'] as String) : null,
      pdResult: json['pdResult'] as String?,
      dryOffDate: json['dryOffDate'] != null ? DateTime.parse(json['dryOffDate'] as String) : null,
      deliveryDate: json['deliveryDate'] != null ? DateTime.parse(json['deliveryDate'] as String) : null,
      deliveryType: json['deliveryType'] as String?,
      calfStatus: json['calfStatus'] as String?,
      calfGender: json['calfGender'] as String?,
      calfId: json['calfId'] as String?,
      deliveryPhotoUrl: json['deliveryPhotoUrl'] as String?,
      deliveryNotes: json['deliveryNotes'] as String?,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : null,
      animal: json['animal'] != null
          ? AnimalSummary.fromJson(json['animal'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toInitiateJson() => {
        'animalId': animalId,
        'conceiveDate': conceiveDate.toIso8601String(),
        'pregnancyType': pregnancyType,
        if (bullId != null) 'bullId': bullId,
        if (bullName != null) 'bullName': bullName,
        if (aiSerialNumber != null) 'aiSerialNumber': aiSerialNumber,
        if (aiCompany != null) 'aiCompany': aiCompany,
      };
}

// ───────────────── Heat Record ─────────────────

class HeatRecord {
  final String id;
  final String animalId;
  final String gaushalaId;
  final DateTime date;
  final String? intensity; // MILD, MODERATE, STRONG
  final String? notes;
  final DateTime? createdAt;

  const HeatRecord({
    required this.id,
    required this.animalId,
    required this.gaushalaId,
    required this.date,
    this.intensity,
    this.notes,
    this.createdAt,
  });

  factory HeatRecord.fromJson(Map<String, dynamic> json) {
    return HeatRecord(
      id: json['id'] as String,
      animalId: json['animalId'] as String,
      gaushalaId: json['gaushalaId'] as String? ?? '',
      date: DateTime.parse(json['date'] as String),
      intensity: json['intensity'] as String?,
      notes: json['notes'] as String?,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'animalId': animalId,
        'date': date.toIso8601String(),
        if (intensity != null) 'intensity': intensity,
        if (notes != null) 'notes': notes,
      };
}

// ───────────────── Dry Off Record ─────────────────

class DryOffRecord {
  final String id;
  final String animalId;
  final String gaushalaId;
  final DateTime dryOffDate;
  final String? reason;
  final String? notes;

  const DryOffRecord({
    required this.id,
    required this.animalId,
    required this.gaushalaId,
    required this.dryOffDate,
    this.reason,
    this.notes,
  });

  factory DryOffRecord.fromJson(Map<String, dynamic> json) {
    return DryOffRecord(
      id: json['id'] as String,
      animalId: json['animalId'] as String,
      gaushalaId: json['gaushalaId'] as String? ?? '',
      dryOffDate: DateTime.parse(json['dryOffDate'] as String),
      reason: json['reason'] as String?,
      notes: json['notes'] as String?,
    );
  }
}

// ───────────────── Parity Record ─────────────────

class ParityRecord {
  final String id;
  final String animalId;
  final String gaushalaId;
  final int parityNumber;
  final DateTime? deliveryDate;
  final String? calfStatus;
  final String? notes;

  const ParityRecord({
    required this.id,
    required this.animalId,
    required this.gaushalaId,
    required this.parityNumber,
    this.deliveryDate,
    this.calfStatus,
    this.notes,
  });

  factory ParityRecord.fromJson(Map<String, dynamic> json) {
    return ParityRecord(
      id: json['id'] as String,
      animalId: json['animalId'] as String,
      gaushalaId: json['gaushalaId'] as String? ?? '',
      parityNumber: json['parityNumber'] as int? ?? 0,
      deliveryDate: json['deliveryDate'] != null
          ? DateTime.parse(json['deliveryDate'] as String)
          : null,
      calfStatus: json['calfStatus'] as String?,
      notes: json['notes'] as String?,
    );
  }
}

// ───────────────── Animal Summary (joined data) ─────────────────

class AnimalSummary {
  final String id;
  final String? name;
  final String? tagNumber;
  final String? animalNumber;
  final String? photoUrl;
  final int? parity;

  const AnimalSummary({
    required this.id,
    this.name,
    this.tagNumber,
    this.animalNumber,
    this.photoUrl,
    this.parity,
  });

  String get displayName => name ?? tagNumber ?? animalNumber ?? 'Unknown';

  factory AnimalSummary.fromJson(Map<String, dynamic> json) {
    return AnimalSummary(
      id: json['id'] as String,
      name: json['name'] as String?,
      tagNumber: json['tagNumber'] as String?,
      animalNumber: json['animalNumber'] as String?,
      photoUrl: json['photoUrl'] as String?,
      parity: json['parity'] as int?,
    );
  }
}
