// ═══════════════════════════════════════════════════════════
// Health Models — matching Health-service Prisma schema
// ═══════════════════════════════════════════════════════════

// ───────────────── Master Data ─────────────────

class DiseaseMaster {
  final String id;
  final String name;
  final String gaushalaId;

  const DiseaseMaster({required this.id, required this.name, required this.gaushalaId});

  factory DiseaseMaster.fromJson(Map<String, dynamic> json) {
    return DiseaseMaster(
      id: json['id'] as String,
      name: json['name'] as String,
      gaushalaId: json['gaushalaId'] as String? ?? '',
    );
  }
}

class VaccineMaster {
  final String id;
  final String name;
  final int frequencyMonths;
  final String gaushalaId;

  const VaccineMaster({
    required this.id,
    required this.name,
    this.frequencyMonths = 0,
    required this.gaushalaId,
  });

  factory VaccineMaster.fromJson(Map<String, dynamic> json) {
    return VaccineMaster(
      id: json['id'] as String,
      name: json['name'] as String,
      frequencyMonths: json['frequencyMonths'] as int? ?? 0,
      gaushalaId: json['gaushalaId'] as String? ?? '',
    );
  }
}

class LabtestMaster {
  final String id;
  final String name;
  final String gaushalaId;

  const LabtestMaster({required this.id, required this.name, required this.gaushalaId});

  factory LabtestMaster.fromJson(Map<String, dynamic> json) {
    return LabtestMaster(
      id: json['id'] as String,
      name: json['name'] as String,
      gaushalaId: json['gaushalaId'] as String? ?? '',
    );
  }
}

// ───────────────── Medical Record ─────────────────

class MedicalRecord {
  final String id;
  final String animalId;
  final String gaushalaId;
  final DateTime visitDate;
  final String? visitType;
  final String? diseaseId;
  final String? symptoms;
  final String? diagnosis;
  final String? treatment;
  final String? medicineName;
  final String? doctorName;
  final double? cost;
  final String? notes;
  final bool isSick;
  final DateTime? recoveryDate;
  final String? eventType; // Set when returned from timeline

  const MedicalRecord({
    required this.id,
    required this.animalId,
    required this.gaushalaId,
    required this.visitDate,
    this.visitType,
    this.diseaseId,
    this.symptoms,
    this.diagnosis,
    this.treatment,
    this.medicineName,
    this.doctorName,
    this.cost,
    this.notes,
    this.isSick = false,
    this.recoveryDate,
    this.eventType,
  });

  factory MedicalRecord.fromJson(Map<String, dynamic> json) {
    return MedicalRecord(
      id: json['id'] as String,
      animalId: json['animalId'] as String,
      gaushalaId: json['gaushalaId'] as String? ?? '',
      visitDate: DateTime.parse(json['visitDate'] as String),
      visitType: json['visitType'] as String?,
      diseaseId: json['diseaseId'] as String?,
      symptoms: json['symptoms'] as String?,
      diagnosis: json['diagnosis'] as String?,
      treatment: json['treatment'] as String?,
      medicineName: json['medicineName'] as String?,
      doctorName: json['doctorName'] as String?,
      cost: _healthParseDouble(json['cost']),
      notes: json['notes'] as String?,
      isSick: json['isSick'] as bool? ?? false,
      recoveryDate: json['recoveryDate'] != null
          ? DateTime.parse(json['recoveryDate'] as String)
          : null,
      eventType: json['eventType'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'animalId': animalId,
        'visitDate': visitDate.toIso8601String(),
        if (visitType != null) 'visitType': visitType,
        if (diseaseId != null) 'diseaseId': diseaseId,
        if (symptoms != null) 'symptoms': symptoms,
        if (diagnosis != null) 'diagnosis': diagnosis,
        if (treatment != null) 'treatment': treatment,
        if (medicineName != null) 'medicineName': medicineName,
        if (doctorName != null) 'doctorName': doctorName,
        if (cost != null) 'cost': cost,
        if (notes != null) 'notes': notes,
      };
}

// ───────────────── Vaccination Record ─────────────────

class VaccinationRecord {
  final String id;
  final String animalId;
  final String gaushalaId;
  final String vaccineId;
  final DateTime doseDate;
  final String? doseType;
  final String? batchNumber;
  final String? administeredBy;
  final String? notes;
  final String? eventType;

  const VaccinationRecord({
    required this.id,
    required this.animalId,
    required this.gaushalaId,
    required this.vaccineId,
    required this.doseDate,
    this.doseType,
    this.batchNumber,
    this.administeredBy,
    this.notes,
    this.eventType,
  });

  factory VaccinationRecord.fromJson(Map<String, dynamic> json) {
    return VaccinationRecord(
      id: json['id'] as String,
      animalId: json['animalId'] as String,
      gaushalaId: json['gaushalaId'] as String? ?? '',
      vaccineId: json['vaccineId'] as String,
      doseDate: DateTime.parse(json['doseDate'] as String),
      doseType: json['doseType'] as String?,
      batchNumber: json['batchNumber'] as String?,
      administeredBy: json['administeredBy'] as String?,
      notes: json['notes'] as String?,
      eventType: json['eventType'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'animalId': animalId,
        'vaccineId': vaccineId,
        'doseDate': doseDate.toIso8601String(),
        if (doseType != null) 'doseType': doseType,
        if (batchNumber != null) 'batchNumber': batchNumber,
        if (administeredBy != null) 'administeredBy': administeredBy,
        if (notes != null) 'notes': notes,
      };
}

// ───────────────── Deworming Record ─────────────────

class DewormingRecord {
  final String id;
  final String animalId;
  final String gaushalaId;
  final DateTime doseDate;
  final DateTime? nextDoseDate;
  final String? doseType; // INJECTION, TABLET
  final String? medicineName;
  final String? companyName;
  final String? batchNumber;
  final String? notes;
  final String? eventType;

  const DewormingRecord({
    required this.id,
    required this.animalId,
    required this.gaushalaId,
    required this.doseDate,
    this.nextDoseDate,
    this.doseType,
    this.medicineName,
    this.companyName,
    this.batchNumber,
    this.notes,
    this.eventType,
  });

  factory DewormingRecord.fromJson(Map<String, dynamic> json) {
    return DewormingRecord(
      id: json['id'] as String,
      animalId: json['animalId'] as String,
      gaushalaId: json['gaushalaId'] as String? ?? '',
      doseDate: DateTime.parse(json['doseDate'] as String),
      nextDoseDate: json['nextDoseDate'] != null
          ? DateTime.parse(json['nextDoseDate'] as String)
          : null,
      doseType: json['doseType'] as String?,
      medicineName: json['medicineName'] as String?,
      companyName: json['companyName'] as String?,
      batchNumber: json['batchNumber'] as String?,
      notes: json['notes'] as String?,
      eventType: json['eventType'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'animalId': animalId,
        'doseDate': doseDate.toIso8601String(),
        if (nextDoseDate != null) 'nextDoseDate': nextDoseDate!.toIso8601String(),
        if (doseType != null) 'doseType': doseType,
        if (medicineName != null) 'medicineName': medicineName,
        if (companyName != null) 'companyName': companyName,
        if (batchNumber != null) 'batchNumber': batchNumber,
        if (notes != null) 'notes': notes,
      };
}

// ───────────────── Lab Record ─────────────────

class LabRecord {
  final String id;
  final String animalId;
  final String gaushalaId;
  final String labtestId;
  final DateTime sampleDate;
  final String? result;
  final String? remark;
  final String? testName; // Populated from master join

  const LabRecord({
    required this.id,
    required this.animalId,
    required this.gaushalaId,
    required this.labtestId,
    required this.sampleDate,
    this.result,
    this.remark,
    this.testName,
  });

  factory LabRecord.fromJson(Map<String, dynamic> json) {
    return LabRecord(
      id: json['id'] as String,
      animalId: json['animalId'] as String,
      gaushalaId: json['gaushalaId'] as String? ?? '',
      labtestId: json['labtestId'] as String,
      sampleDate: DateTime.parse(json['sampleDate'] as String),
      result: json['result'] as String?,
      remark: json['remark'] as String?,
      testName: json['testName'] as String?,
    );
  }
}

// ───────────────── Health Timeline Event ─────────────────

class HealthTimelineEvent {
  final String id;
  final String eventType; // MEDICAL, VACCINATION, DEWORMING
  final DateTime date;
  final Map<String, dynamic> rawData;

  const HealthTimelineEvent({
    required this.id,
    required this.eventType,
    required this.date,
    required this.rawData,
  });

  factory HealthTimelineEvent.fromJson(Map<String, dynamic> json) {
    final eventType = json['eventType'] as String? ?? 'UNKNOWN';
    DateTime date;
    switch (eventType) {
      case 'MEDICAL':
        date = DateTime.parse(json['visitDate'] as String);
        break;
      case 'VACCINATION':
      case 'DEWORMING':
        date = DateTime.parse(json['doseDate'] as String);
        break;
      default:
        date = DateTime.now();
    }

    return HealthTimelineEvent(
      id: json['id'] as String,
      eventType: eventType,
      date: date,
      rawData: json,
    );
  }
}

// ───────────────── Helpers ─────────────────

double? _healthParseDouble(dynamic value) {
  if (value == null) return null;
  if (value is double) return value;
  if (value is int) return value.toDouble();
  return double.tryParse(value.toString());
}
