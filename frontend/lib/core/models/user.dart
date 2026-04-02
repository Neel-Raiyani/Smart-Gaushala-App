// ═══════════════════════════════════════════════════════════
// User & Gaushala Models — matching Auth-service Prisma schema
// ═══════════════════════════════════════════════════════════

class User {
  final String id;
  final String? name;
  final String mobileNumber;
  final String? city;
  final String? language;
  final bool isActive;
  final DateTime? createdAt;
  final List<GaushalaInfo> gaushalas;

  const User({
    required this.id,
    this.name,
    required this.mobileNumber,
    this.city,
    this.language,
    this.isActive = true,
    this.createdAt,
    this.gaushalas = const [],
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      name: json['name'] as String?,
      mobileNumber: json['mobileNumber'] as String,
      city: json['city'] as String?,
      language: json['language'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
      gaushalas: (json['gaushalas'] as List<dynamic>?)
              ?.map((e) => GaushalaInfo.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class GaushalaInfo {
  final String id;
  final String name;
  final String role; // OWNER, MANAGER, STAFF, VETERINARIAN
  final String? city;
  final int? totalCattle;
  final bool? isActive;

  const GaushalaInfo({
    required this.id,
    required this.name,
    required this.role,
    this.city,
    this.totalCattle,
    this.isActive,
  });

  factory GaushalaInfo.fromJson(Map<String, dynamic> json) {
    return GaushalaInfo(
      id: json['id'] as String,
      name: json['name'] as String,
      role: json['role'] as String,
      city: json['city'] as String?,
      totalCattle: json['totalCattle'] as int?,
      isActive: json['isActive'] as bool?,
    );
  }
}

/// Login response from POST /api/auth/login
class LoginResponse {
  final String token;
  final List<GaushalaInfo> gaushalas;

  const LoginResponse({required this.token, required this.gaushalas});

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      token: json['token'] as String,
      gaushalas: (json['gaushalas'] as List<dynamic>?)
              ?.map((e) => GaushalaInfo.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

/// Staff member info
class StaffMember {
  final String id;
  final String? name;
  final String? mobileNumber;
  final String? city;
  final String role;
  final DateTime? joinedAt;

  const StaffMember({
    required this.id,
    this.name,
    this.mobileNumber,
    this.city,
    required this.role,
    this.joinedAt,
  });

  factory StaffMember.fromJson(Map<String, dynamic> json) {
    return StaffMember(
      id: json['id'] as String,
      name: json['name'] as String?,
      mobileNumber: json['mobileNumber'] as String?,
      city: json['city'] as String?,
      role: json['role'] as String,
      joinedAt: json['joinedAt'] != null
          ? DateTime.parse(json['joinedAt'] as String)
          : null,
    );
  }
}
