import 'package:flutter/material.dart';

class AppColors {
  // Primary — Jade Green (derived from cow_icon.png)
  static const Color primary = Color(0xFF2D6A4F);
  static const Color primaryLight = Color(0xFF40916C);
  static const Color primaryDark = Color(0xFF1B4332);

  // Accent — Brass/Gold (from cow_icon.png gold accents)
  static const Color accent = Color(0xFFB5894D);
  static const Color accentLight = Color(0xFFD4A96A);

  // Backgrounds
  static const Color background = Color(0xFFF6F8F7);
  static const Color surface = Colors.white;
  static const Color surfaceTint = Color(0xFFF0F4F2);

  // Text
  static const Color textPrimary = Color(0xFF1A1D1B);
  static const Color textSecondary = Color(0xFF6E7B73);
  static const Color textTertiary = Color(0xFF9CA8A1);

  // Borders
  static const Color border = Color(0xFFE2E8E5);
  static const Color borderLight = Color(0xFFF0F2F1);

  // Semantic
  static const Color destructive = Color(0xFFD14343);
  static const Color success = Color(0xFF2D9D6A);
  static const Color warning = Color(0xFFE5A100);
  static const Color info = Color(0xFF3B82C4);

  // Shadows
  static List<BoxShadow> get cardShadow => [
    BoxShadow(
      color: const Color(0xFF1A1D1B).withValues(alpha: 0.04),
      blurRadius: 8,
      offset: const Offset(0, 2),
    ),
  ];

  static List<BoxShadow> get elevatedShadow => [
    BoxShadow(
      color: const Color(0xFF1A1D1B).withValues(alpha: 0.08),
      blurRadius: 16,
      offset: const Offset(0, 4),
    ),
  ];
}
