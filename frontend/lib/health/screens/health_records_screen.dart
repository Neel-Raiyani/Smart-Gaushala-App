import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../design_system/theme/app_colors.dart';

class HealthRecordsScreen extends StatefulWidget {
  const HealthRecordsScreen({super.key});

  @override
  State<HealthRecordsScreen> createState() => _HealthRecordsScreenState();
}

class _HealthRecordsScreenState extends State<HealthRecordsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedFilter = 'All';

  final List<_HealthRecord> _records = [
    _HealthRecord('GIR-001', 'Lakshmi', 'Vaccination', 'FMD Vaccine administered', '2026-03-28', Icons.vaccines_outlined, AppColors.info),
    _HealthRecord('GIR-003', 'Gauri', 'Medical Visit', 'Routine checkup - healthy', '2026-03-27', Icons.local_hospital_outlined, AppColors.success),
    _HealthRecord('SAH-005', 'Nandini', 'Deworming', 'Albendazole 10ml oral', '2026-03-26', Icons.medication_outlined, const Color(0xFF8B5CF6)),
    _HealthRecord('GIR-002', 'Kamdhenu', 'Medical Visit', 'Mild fever - treated', '2026-03-25', Icons.local_hospital_outlined, AppColors.warning),
    _HealthRecord('SAH-007', 'Surabhi', 'Vaccination', 'Brucellosis booster', '2026-03-24', Icons.vaccines_outlined, AppColors.info),
    _HealthRecord('GIR-004', 'Kapila', 'Lab Test', 'Milk sample sent for analysis', '2026-03-23', Icons.science_outlined, const Color(0xFF4F46E5)),
    _HealthRecord('SAH-009', 'Rohini', 'Deworming', 'Ivermectin injection', '2026-03-22', Icons.medication_outlined, const Color(0xFF8B5CF6)),
    _HealthRecord('GIR-006', 'Ganga', 'Medical Visit', 'Hoof trimming completed', '2026-03-20', Icons.local_hospital_outlined, AppColors.success),
  ];

  final List<String> _filters = ['All', 'Vaccination', 'Medical Visit', 'Deworming', 'Lab Test'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<_HealthRecord> get _filteredRecords {
    if (_selectedFilter == 'All') return _records;
    return _records.where((r) => r.type == _selectedFilter).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Health Records', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: SizedBox(
            height: 48,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _filters.length,
              itemBuilder: (_, i) {
                final f = _filters[i];
                final isActive = _selectedFilter == f;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    selected: isActive,
                    label: Text(f, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600)),
                    selectedColor: AppColors.primary.withValues(alpha: 0.12),
                    checkmarkColor: AppColors.primary,
                    side: BorderSide(color: isActive ? AppColors.primary : AppColors.border),
                    backgroundColor: AppColors.surface,
                    onSelected: (_) => setState(() => _selectedFilter = f),
                  ),
                );
              },
            ),
          ),
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _filteredRecords.length,
        itemBuilder: (_, i) {
          final record = _filteredRecords[i];
          return TweenAnimationBuilder<double>(
            tween: Tween(begin: 0.0, end: 1.0),
            duration: Duration(milliseconds: 300 + (i * 80)),
            curve: Curves.easeOutCubic,
            builder: (_, value, child) => Opacity(
              opacity: value,
              child: Transform.translate(offset: Offset(0, 20 * (1 - value)), child: child),
            ),
            child: _buildRecordCard(record),
          );
        },
      ),
    );
  }

  Widget _buildRecordCard(_HealthRecord record) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppColors.cardShadow,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AnimalHealthHistoryScreen(animalTag: record.tag, animalName: record.name))),
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: record.color.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(record.icon, size: 22, color: record.color),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(record.name, style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(color: AppColors.surfaceTint, borderRadius: BorderRadius.circular(6)),
                            child: Text(record.tag, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textTertiary)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(record.description, style: GoogleFonts.inter(fontSize: 13, color: AppColors.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: record.color.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(6)),
                            child: Text(record.type, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: record.color)),
                          ),
                          const Spacer(),
                          Icon(Icons.calendar_today_outlined, size: 12, color: AppColors.textTertiary),
                          const SizedBox(width: 4),
                          Text(record.date, style: GoogleFonts.inter(fontSize: 12, color: AppColors.textTertiary)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.chevron_right_rounded, size: 20, color: AppColors.textTertiary),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════
// ANIMAL HEALTH HISTORY (Timeline)
// ═══════════════════════════════════════════════
class AnimalHealthHistoryScreen extends StatelessWidget {
  final String animalTag;
  final String animalName;

  const AnimalHealthHistoryScreen({super.key, required this.animalTag, required this.animalName});

  @override
  Widget build(BuildContext context) {
    final events = [
      _TimelineEvent('Vaccination', 'FMD Vaccine dose 2 administered', '2026-03-28', Icons.vaccines_outlined, AppColors.info),
      _TimelineEvent('Checkup', 'Routine health examination - all clear', '2026-03-20', Icons.local_hospital_outlined, AppColors.success),
      _TimelineEvent('Deworming', 'Albendazole oral dose completed', '2026-03-10', Icons.medication_outlined, const Color(0xFF8B5CF6)),
      _TimelineEvent('Lab Test', 'Blood sample collected for brucellosis', '2026-02-28', Icons.science_outlined, const Color(0xFF4F46E5)),
      _TimelineEvent('Vaccination', 'FMD Vaccine dose 1', '2026-02-15', Icons.vaccines_outlined, AppColors.info),
      _TimelineEvent('Registration', 'Animal registered in system', '2026-01-10', Icons.app_registration_outlined, AppColors.accent),
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(animalName, style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w600)),
            Text(animalTag, style: GoogleFonts.inter(fontSize: 12, color: AppColors.textTertiary)),
          ],
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: events.length,
        itemBuilder: (_, i) {
          final event = events[i];
          final isLast = i == events.length - 1;
          return TweenAnimationBuilder<double>(
            tween: Tween(begin: 0.0, end: 1.0),
            duration: Duration(milliseconds: 400 + (i * 100)),
            curve: Curves.easeOutCubic,
            builder: (_, value, child) => Opacity(opacity: value, child: Transform.translate(offset: Offset(0, 16 * (1 - value)), child: child)),
            child: IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Timeline rail
                  SizedBox(
                    width: 40,
                    child: Column(
                      children: [
                        Container(
                          width: 14,
                          height: 14,
                          decoration: BoxDecoration(
                            color: event.color,
                            shape: BoxShape.circle,
                            border: Border.all(color: event.color.withValues(alpha: 0.3), width: 3),
                          ),
                        ),
                        if (!isLast)
                          Expanded(
                            child: Container(width: 2, color: AppColors.border),
                          ),
                      ],
                    ),
                  ),
                  // Event card
                  Expanded(
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 20),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: AppColors.cardShadow,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(event.icon, size: 18, color: event.color),
                              const SizedBox(width: 8),
                              Text(event.title, style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                              const Spacer(),
                              Text(event.date, style: GoogleFonts.inter(fontSize: 11, color: AppColors.textTertiary)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(event.description, style: GoogleFonts.inter(fontSize: 13, color: AppColors.textSecondary, height: 1.4)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _HealthRecord {
  final String tag, name, type, description, date;
  final IconData icon;
  final Color color;
  const _HealthRecord(this.tag, this.name, this.type, this.description, this.date, this.icon, this.color);
}

class _TimelineEvent {
  final String title, description, date;
  final IconData icon;
  final Color color;
  const _TimelineEvent(this.title, this.description, this.date, this.icon, this.color);
}
