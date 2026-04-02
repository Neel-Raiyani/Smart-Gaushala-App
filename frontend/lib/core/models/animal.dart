// ═══════════════════════════════════════════════════════════
// Animal Models — matching Animal-service Prisma schema
// ═══════════════════════════════════════════════════════════

// ───────────────── Enums ─────────────────
// Using lowerCamelCase per Dart convention. Use .name for API serialization.

enum Gender { male, female }

enum AnimalStatus { active, sold, deceased, donated }

enum CowBreed {
  gir, sahiwal, redSindhi, tharparkar, rathi, kankrej,
  hariana, ongole, deoni, hallikar, amritMahal, krishnaValley,
  nimari, malvi, nagori, dangi, khillari, bargur,
  jersey, holsteinFriesian, brownSwiss, ayrshire, guernsey,
  crossbreed, murrah, mehsana, jaffarabadi, other
}

enum BullType { gaushala, ai }

enum AcquisitionType { birth, purchased, donated, other }

// ───────────────── Animal Model ─────────────────

class Animal {
  final String id;
  final String? name;
  final String? tagNumber;
  final String? animalNumber;
  final String gender;
  final String gaushalaId;
  final String? cowBreed;
  final String? cowGroupId;
  final CowGroupInfo? cowGroup;
  final DateTime? birthDate;
  final DateTime? adultDate;
  final int? parity;
  final bool isPregnant;
  final bool isLactating;
  final bool isDryOff;
  final bool isHeifer;
  final bool isRetired;
  final String? bullType;
  final String? bullView;
  final double? motherMilk;
  final double? grandmotherMilk;
  final bool isHandicapped;
  final String? handicapReason;
  final String? acquisitionType;
  final DateTime? purchaseDate;
  final String? purchasedFrom;
  final double? purchasePrice;
  final String? ownerName;
  final String? ownerMobile;
  final String? photoUrl;
  final String? viewUrl;
  final bool isUdderClosedFL;
  final bool isUdderClosedFR;
  final bool isUdderClosedBL;
  final bool isUdderClosedBR;
  final String? motherName;
  final String? fatherName;
  final String? motherId;
  final String? fatherId;
  final String status;
  final bool isActive;
  final DateTime? createdAt;

  // Disposal records (included in getAnimalById)
  final SellRecord? sellRecord;
  final DeathRecord? deathRecord;
  final DonationRecord? donationRecord;

  const Animal({
    required this.id,
    this.name,
    this.tagNumber,
    this.animalNumber,
    required this.gender,
    required this.gaushalaId,
    this.cowBreed,
    this.cowGroupId,
    this.cowGroup,
    this.birthDate,
    this.adultDate,
    this.parity,
    this.isPregnant = false,
    this.isLactating = false,
    this.isDryOff = false,
    this.isHeifer = false,
    this.isRetired = false,
    this.bullType,
    this.bullView,
    this.motherMilk,
    this.grandmotherMilk,
    this.isHandicapped = false,
    this.handicapReason,
    this.acquisitionType,
    this.purchaseDate,
    this.purchasedFrom,
    this.purchasePrice,
    this.ownerName,
    this.ownerMobile,
    this.photoUrl,
    this.viewUrl,
    this.isUdderClosedFL = false,
    this.isUdderClosedFR = false,
    this.isUdderClosedBL = false,
    this.isUdderClosedBR = false,
    this.motherName,
    this.fatherName,
    this.motherId,
    this.fatherId,
    this.status = 'ACTIVE',
    this.isActive = true,
    this.createdAt,
    this.sellRecord,
    this.deathRecord,
    this.donationRecord,
  });

  /// Display label: name or tag or "Unknown"
  String get displayName => name ?? tagNumber ?? animalNumber ?? 'Unknown';

  /// Current lifecycle status label
  String get statusLabel {
    if (isPregnant) return 'Pregnant';
    if (isLactating) return 'Lactating';
    if (isDryOff) return 'Dry Off';
    if (isHeifer) return 'Heifer';
    if (isRetired) return 'Retired';
    if (isHandicapped) return 'Handicapped';
    return 'Active';
  }

  /// Age in months from birthDate
  int? get ageInMonths {
    if (birthDate == null) return null;
    final now = DateTime.now();
    return (now.difference(birthDate!).inDays / 30.44).floor();
  }

  /// Number of closed udders
  int get closedUdderCount {
    int count = 0;
    if (isUdderClosedFL) count++;
    if (isUdderClosedFR) count++;
    if (isUdderClosedBL) count++;
    if (isUdderClosedBR) count++;
    return count;
  }

  factory Animal.fromJson(Map<String, dynamic> json) {
    return Animal(
      id: json['id'] as String,
      name: json['name'] as String?,
      tagNumber: json['tagNumber'] as String?,
      animalNumber: json['animalNumber'] as String?,
      gender: json['gender'] as String? ?? 'FEMALE',
      gaushalaId: json['gaushalaId'] as String? ?? '',
      cowBreed: json['cowBreed'] as String?,
      cowGroupId: json['cowGroupId'] as String?,
      cowGroup: json['cowGroup'] != null
          ? CowGroupInfo.fromJson(json['cowGroup'] as Map<String, dynamic>)
          : null,
      birthDate: _parseDate(json['birthDate']),
      adultDate: _parseDate(json['adultDate']),
      parity: json['parity'] as int?,
      isPregnant: json['isPregnant'] as bool? ?? false,
      isLactating: json['isLactating'] as bool? ?? false,
      isDryOff: json['isDryOff'] as bool? ?? false,
      isHeifer: json['isHeifer'] as bool? ?? false,
      isRetired: json['isRetired'] as bool? ?? false,
      bullType: json['bullType'] as String?,
      bullView: json['bullView'] as String?,
      motherMilk: _parseDouble(json['motherMilk']),
      grandmotherMilk: _parseDouble(json['grandmotherMilk']),
      isHandicapped: json['isHandicapped'] as bool? ?? false,
      handicapReason: json['handicapReason'] as String?,
      acquisitionType: json['acquisitionType'] as String?,
      purchaseDate: _parseDate(json['purchaseDate']),
      purchasedFrom: json['purchasedFrom'] as String?,
      purchasePrice: _parseDouble(json['purchasePrice']),
      ownerName: json['ownerName'] as String?,
      ownerMobile: json['ownerMobile'] as String?,
      photoUrl: json['photoUrl'] as String?,
      viewUrl: json['viewUrl'] as String?,
      isUdderClosedFL: json['isUdderClosedFL'] as bool? ?? false,
      isUdderClosedFR: json['isUdderClosedFR'] as bool? ?? false,
      isUdderClosedBL: json['isUdderClosedBL'] as bool? ?? false,
      isUdderClosedBR: json['isUdderClosedBR'] as bool? ?? false,
      motherName: json['motherName'] as String?,
      fatherName: json['fatherName'] as String?,
      motherId: json['motherId'] as String?,
      fatherId: json['fatherId'] as String?,
      status: json['status'] as String? ?? 'ACTIVE',
      isActive: json['isActive'] as bool? ?? true,
      createdAt: _parseDate(json['createdAt']),
      sellRecord: json['sellRecord'] != null
          ? SellRecord.fromJson(json['sellRecord'] as Map<String, dynamic>)
          : null,
      deathRecord: json['deathRecord'] != null
          ? DeathRecord.fromJson(json['deathRecord'] as Map<String, dynamic>)
          : null,
      donationRecord: json['donationRecord'] != null
          ? DonationRecord.fromJson(json['donationRecord'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    final data = <String, dynamic>{};
    if (name != null) data['name'] = name;
    if (tagNumber != null) data['tagNumber'] = tagNumber;
    if (animalNumber != null) data['animalNumber'] = animalNumber;
    data['gender'] = gender;
    if (cowBreed != null) data['cowBreed'] = cowBreed;
    if (cowGroupId != null) data['cowGroupId'] = cowGroupId;
    if (birthDate != null) data['birthDate'] = birthDate!.toIso8601String();
    if (parity != null) data['parity'] = parity;
    if (bullType != null) data['bullType'] = bullType;
    if (bullView != null) data['bullView'] = bullView;
    if (motherMilk != null) data['motherMilk'] = motherMilk;
    if (grandmotherMilk != null) data['grandmotherMilk'] = grandmotherMilk;
    data['isHandicapped'] = isHandicapped;
    if (handicapReason != null) data['handicapReason'] = handicapReason;
    if (acquisitionType != null) data['acquisitionType'] = acquisitionType;
    if (purchaseDate != null) data['purchaseDate'] = purchaseDate!.toIso8601String();
    if (purchasedFrom != null) data['purchasedFrom'] = purchasedFrom;
    if (purchasePrice != null) data['purchasePrice'] = purchasePrice;
    if (ownerName != null) data['ownerName'] = ownerName;
    if (ownerMobile != null) data['ownerMobile'] = ownerMobile;
    if (photoUrl != null) data['photoUrl'] = photoUrl;
    data['isUdderClosedFL'] = isUdderClosedFL;
    data['isUdderClosedFR'] = isUdderClosedFR;
    data['isUdderClosedBL'] = isUdderClosedBL;
    data['isUdderClosedBR'] = isUdderClosedBR;
    if (motherName != null) data['motherName'] = motherName;
    if (fatherName != null) data['fatherName'] = fatherName;
    if (motherId != null) data['motherId'] = motherId;
    if (fatherId != null) data['fatherId'] = fatherId;
    return data;
  }
}

// ───────────────── Cow Group ─────────────────

class CowGroupInfo {
  final String? name;

  const CowGroupInfo({this.name});

  factory CowGroupInfo.fromJson(Map<String, dynamic> json) {
    return CowGroupInfo(name: json['name'] as String?);
  }
}

class CowGroup {
  final String id;
  final String name;
  final String gaushalaId;

  const CowGroup({required this.id, required this.name, required this.gaushalaId});

  factory CowGroup.fromJson(Map<String, dynamic> json) {
    return CowGroup(
      id: json['id'] as String,
      name: json['name'] as String,
      gaushalaId: json['gaushalaId'] as String? ?? '',
    );
  }
}

// ───────────────── Disposal Records ─────────────────

class SellRecord {
  final String id;
  final String animalId;
  final DateTime sellDate;
  final double? sellPrice;
  final String? buyerName;
  final String? buyerMobile;
  final String? photoUrl;
  final String? reason;

  const SellRecord({
    required this.id,
    required this.animalId,
    required this.sellDate,
    this.sellPrice,
    this.buyerName,
    this.buyerMobile,
    this.photoUrl,
    this.reason,
  });

  factory SellRecord.fromJson(Map<String, dynamic> json) {
    return SellRecord(
      id: json['id'] as String,
      animalId: json['animalId'] as String,
      sellDate: DateTime.parse(json['sellDate'] as String),
      sellPrice: _parseDouble(json['sellPrice']),
      buyerName: json['buyerName'] as String?,
      buyerMobile: json['buyerMobile'] as String?,
      photoUrl: json['photoUrl'] as String?,
      reason: json['reason'] as String?,
    );
  }
}

class DeathRecord {
  final String id;
  final String animalId;
  final DateTime deathDate;
  final String? cause;
  final String? photoUrl;
  final String? notes;

  const DeathRecord({
    required this.id,
    required this.animalId,
    required this.deathDate,
    this.cause,
    this.photoUrl,
    this.notes,
  });

  factory DeathRecord.fromJson(Map<String, dynamic> json) {
    return DeathRecord(
      id: json['id'] as String,
      animalId: json['animalId'] as String,
      deathDate: DateTime.parse(json['deathDate'] as String),
      cause: json['cause'] as String?,
      photoUrl: json['photoUrl'] as String?,
      notes: json['notes'] as String?,
    );
  }
}

class DonationRecord {
  final String id;
  final String animalId;
  final DateTime donationDate;
  final String? donatedTo;
  final String? donorMobile;
  final String? photoUrl;
  final String? notes;

  const DonationRecord({
    required this.id,
    required this.animalId,
    required this.donationDate,
    this.donatedTo,
    this.donorMobile,
    this.photoUrl,
    this.notes,
  });

  factory DonationRecord.fromJson(Map<String, dynamic> json) {
    return DonationRecord(
      id: json['id'] as String,
      animalId: json['animalId'] as String,
      donationDate: DateTime.parse(json['donationDate'] as String),
      donatedTo: json['donatedTo'] as String?,
      donorMobile: json['donorMobile'] as String?,
      photoUrl: json['photoUrl'] as String?,
      notes: json['notes'] as String?,
    );
  }
}

// ───────────────── Helpers ─────────────────

DateTime? _parseDate(dynamic value) {
  if (value == null) return null;
  if (value is DateTime) return value;
  return DateTime.tryParse(value.toString());
}

double? _parseDouble(dynamic value) {
  if (value == null) return null;
  if (value is double) return value;
  if (value is int) return value.toDouble();
  return double.tryParse(value.toString());
}
