import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../design_system/theme/app_colors.dart';

class BreedingDashboardScreen extends StatelessWidget {
  const BreedingDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context).textTheme;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Breeding Management', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Summary stats
            Row(
              children: [
                Expanded(child: _buildSummaryCard('Active Heats', '3', Icons.thermostat_outlined, const Color(0xFFE84393))),
                const SizedBox(width: 12),
                Expanded(child: _buildSummaryCard('Pregnant', '5', Icons.child_friendly_outlined, const Color(0xFF8B5CF6))),
                const SizedBox(width: 12),
                Expanded(child: _buildSummaryCard('Due Soon', '2', Icons.timer_outlined, AppColors.warning)),
              ],
            ),
            const SizedBox(height: 28),

            // Heat Records
            Text('Recent Heat Records', style: theme.headlineMedium),
            const SizedBox(height: 14),
            ..._buildHeatRecords(),
            const SizedBox(height: 28),

            // Active Journeys
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Conception Journeys', style: theme.headlineMedium),
                Text('View All', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.accent)),
              ],
            ),
            const SizedBox(height: 14),
            ..._buildJourneyCards(context),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCard(String label, String count, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(color: color.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, size: 20, color: color),
          ),
          const SizedBox(height: 10),
          Text(count, style: GoogleFonts.poppins(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.textPrimary, height: 1)),
          const SizedBox(height: 4),
          Text(label, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.textSecondary), textAlign: TextAlign.center),
        ],
      ),
    );
  }

  List<Widget> _buildHeatRecords() {
    final heats = [
      {'name': 'Lakshmi', 'tag': 'GIR-001', 'detected': '2026-03-30', 'status': 'Active'},
      {'name': 'Gauri', 'tag': 'GIR-003', 'detected': '2026-03-29', 'status': 'AI Scheduled'},
      {'name': 'Rohini', 'tag': 'SAH-009', 'detected': '2026-03-28', 'status': 'Inseminated'},
    ];
    return heats.map((h) => Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        boxShadow: AppColors.cardShadow,
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(color: const Color(0xFFE84393).withValues(alpha: 0.08), borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.thermostat_outlined, size: 20, color: Color(0xFFE84393)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(h['name']!, style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(color: AppColors.surfaceTint, borderRadius: BorderRadius.circular(6)),
                      child: Text(h['tag']!, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textTertiary)),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text('Detected: ${h['detected']}', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textTertiary)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: h['status'] == 'Active' ? const Color(0xFFE84393).withValues(alpha: 0.08) : AppColors.primary.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(h['status']!, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: h['status'] == 'Active' ? const Color(0xFFE84393) : AppColors.primary)),
          ),
        ],
      ),
    )).toList();
  }

  List<Widget> _buildJourneyCards(BuildContext context) {
    final journeys = [
      Journey('Gauri', 'GIR-003', 'Pregnant', 2, const Color(0xFF8B5CF6)),
      Journey('Nandini', 'SAH-005', 'Dry Off', 3, AppColors.warning),
      Journey('Kapila', 'GIR-004', 'Initiated', 1, AppColors.info),
    ];
    return journeys.map((j) => GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ConceptionJourneyScreen(journey: j))),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(14),
          boxShadow: AppColors.cardShadow,
        ),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(color: j.color.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(12)),
                  child: Icon(Icons.child_friendly_outlined, size: 20, color: j.color),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(j.name, style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                      Text(j.tag, style: GoogleFonts.inter(fontSize: 12, color: AppColors.textTertiary)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(color: j.color.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(8)),
                  child: Text(j.stage, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: j.color)),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.chevron_right_rounded, size: 20, color: AppColors.textTertiary),
              ],
            ),
            const SizedBox(height: 14),
            // Progress bar
            _buildJourneyProgress(j.stageIndex),
          ],
        ),
      ),
    )).toList();
  }

  Widget _buildJourneyProgress(int currentStage) {
    final stages = ['Initiated', 'Pregnant', 'Dry Off', 'Delivered'];
    return Row(
      children: List.generate(stages.length, (i) {
        final isComplete = i < currentStage;
        final isCurrent = i == currentStage;
        return Expanded(
          child: Row(
            children: [
              Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  color: isComplete ? AppColors.success : (isCurrent ? AppColors.primary : AppColors.surfaceTint),
                  shape: BoxShape.circle,
                  border: (!isComplete && !isCurrent) ? Border.all(color: AppColors.border) : null,
                ),
                child: isComplete
                    ? const Icon(Icons.check, size: 12, color: Colors.white)
                    : Center(child: Text('${i + 1}', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: isCurrent ? Colors.white : AppColors.textTertiary))),
              ),
              if (i < stages.length - 1)
                Expanded(
                  child: Container(height: 2, color: isComplete ? AppColors.success : AppColors.border),
                ),
            ],
          ),
        );
      }),
    );
  }
}

// ═══════════════════════════════════════════════
// CONCEPTION JOURNEY DETAIL SCREEN
// ═══════════════════════════════════════════════
class ConceptionJourneyScreen extends StatelessWidget {
  final Journey journey;
  const ConceptionJourneyScreen({super.key, required this.journey});

  @override
  Widget build(BuildContext context) {
    final stages = [
      StageDetail('Initiated', 'AI or natural service recorded', '2026-02-15', Icons.play_circle_outline, true),
      StageDetail('Pregnant', 'Pregnancy confirmed via PD', '2026-03-15', Icons.child_friendly_outlined, journey.stageIndex >= 2),
      StageDetail('Dry Off', 'Milking stopped for preparation', journey.stageIndex >= 3 ? '2026-06-15' : 'Pending', Icons.pause_circle_outlined, journey.stageIndex >= 3),
      StageDetail('Delivered', 'Calf born successfully', 'Pending', Icons.celebration_outlined, journey.stageIndex >= 4),
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(journey.name, style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w600)),
            Text('${journey.tag} • Conception Journey', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textTertiary)),
          ],
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: stages.length,
        itemBuilder: (_, i) {
          final stage = stages[i];
          final isLast = i == stages.length - 1;
          final isCurrent = i == journey.stageIndex;
          return IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 40,
                  child: Column(
                    children: [
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: stage.isComplete ? AppColors.success : (isCurrent ? AppColors.primary : AppColors.surfaceTint),
                          shape: BoxShape.circle,
                          border: (!stage.isComplete && !isCurrent) ? Border.all(color: AppColors.border, width: 2) : null,
                        ),
                        child: stage.isComplete
                            ? const Icon(Icons.check, size: 16, color: Colors.white)
                            : Center(child: Text('${i + 1}', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: isCurrent ? Colors.white : AppColors.textTertiary))),
                      ),
                      if (!isLast)
                        Expanded(
                          child: Container(width: 2, color: stage.isComplete ? AppColors.success : AppColors.border),
                        ),
                    ],
                  ),
                ),
                Expanded(
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 20),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isCurrent ? AppColors.primary.withValues(alpha: 0.04) : AppColors.surface,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: AppColors.cardShadow,
                      border: isCurrent ? Border.all(color: AppColors.primary.withValues(alpha: 0.2)) : null,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(stage.icon, size: 18, color: stage.isComplete ? AppColors.success : (isCurrent ? AppColors.primary : AppColors.textTertiary)),
                            const SizedBox(width: 8),
                            Text(stage.title, style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                            const Spacer(),
                            if (isCurrent)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                                child: Text('Current', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primary)),
                              ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(stage.description, style: GoogleFonts.inter(fontSize: 13, color: AppColors.textSecondary)),
                        const SizedBox(height: 4),
                        Text(stage.date, style: GoogleFonts.inter(fontSize: 12, color: AppColors.textTertiary)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class Journey {
  final String name, tag, stage;
  final int stageIndex;
  final Color color;
  const Journey(this.name, this.tag, this.stage, this.stageIndex, this.color);
}

class StageDetail {
  final String title, description, date;
  final IconData icon;
  final bool isComplete;
  const StageDetail(this.title, this.description, this.date, this.icon, this.isComplete);
}
