// ═══════════════════════════════════════════════════════════
// Media Models — matching Media-service Prisma schema
// ═══════════════════════════════════════════════════════════

// ───────────────── Folder ─────────────────

class MediaFolder {
  final String id;
  final String name;
  final String type; // PHOTO, VIDEO
  final String gaushalaId;
  final int itemCount;
  final DateTime? createdAt;

  const MediaFolder({
    required this.id,
    required this.name,
    required this.type,
    required this.gaushalaId,
    this.itemCount = 0,
    this.createdAt,
  });

  factory MediaFolder.fromJson(Map<String, dynamic> json) {
    return MediaFolder(
      id: json['id'] as String,
      name: json['name'] as String,
      type: json['type'] as String? ?? 'PHOTO',
      gaushalaId: json['gaushalaId'] as String? ?? '',
      itemCount: json['itemCount'] as int? ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
    );
  }
}

// ───────────────── Gallery Item ─────────────────

class GalleryItem {
  final String id;
  final String folderId;
  final String gaushalaId;
  final String fileName;
  final String originalName;
  final String mimeType;
  final int size;
  final String? viewUrl; // Presigned URL for display
  final DateTime? createdAt;

  const GalleryItem({
    required this.id,
    required this.folderId,
    required this.gaushalaId,
    required this.fileName,
    required this.originalName,
    required this.mimeType,
    required this.size,
    this.viewUrl,
    this.createdAt,
  });

  bool get isImage => mimeType.startsWith('image/');
  bool get isVideo => mimeType.startsWith('video/');

  /// Human-readable file size
  String get fileSizeLabel {
    if (size < 1024) return '$size B';
    if (size < 1024 * 1024) return '${(size / 1024).toStringAsFixed(1)} KB';
    return '${(size / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  factory GalleryItem.fromJson(Map<String, dynamic> json) {
    return GalleryItem(
      id: json['id'] as String,
      folderId: json['folderId'] as String,
      gaushalaId: json['gaushalaId'] as String? ?? '',
      fileName: json['fileName'] as String,
      originalName: json['originalName'] as String,
      mimeType: json['mimeType'] as String,
      size: json['size'] as int? ?? 0,
      viewUrl: json['viewUrl'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
    );
  }
}

// ───────────────── Presigned Upload Response ─────────────────

class PresignedUploadData {
  final String uploadUrl;
  final String key;

  const PresignedUploadData({required this.uploadUrl, required this.key});

  factory PresignedUploadData.fromJson(Map<String, dynamic> json) {
    return PresignedUploadData(
      uploadUrl: (json['uploadUrl'] ?? json['url']) as String,
      key: json['key'] as String,
    );
  }
}
