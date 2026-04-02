import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../design_system/theme/app_colors.dart';
import '../../core/models/user.dart';
import '../providers/auth_provider.dart';

/// Gaushala selection screen — shown after login when user has multiple gaushalas.
/// Receives the list from login response and stores the selection.
class GaushalaSelectionScreen extends ConsumerWidget {
  final List<GaushalaInfo> gaushalas;

  const GaushalaSelectionScreen({super.key, required this.gaushalas});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Select Gaushala', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Welcome!', style: theme.headlineLarge),
              const SizedBox(height: 6),
              Text('Select the gaushala you want to manage.', style: theme.bodyMedium),
              const SizedBox(height: 32),
              ...gaushalas.map((g) => Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: _buildSelectionCard(context, ref, g),
              )),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSelectionCard(BuildContext context, WidgetRef ref, GaushalaInfo gaushala) {
    return InkWell(
      onTap: () async {
        await ref.read(authProvider.notifier).selectGaushala(gaushala);
        if (context.mounted) {
          Navigator.pop(context, true);
        }
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          boxShadow: AppColors.cardShadow,
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.warehouse_outlined, color: AppColors.primary, size: 22),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    gaushala.name,
                    style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    '${gaushala.city ?? 'Unknown City'}  •  ${gaushala.role}',
                    style: GoogleFonts.inter(fontSize: 13, color: AppColors.textSecondary),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: AppColors.textTertiary),
          ],
        ),
      ),
    );
  }
}
