import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../design_system/theme/app_colors.dart';

class MilkProductionScreen extends StatelessWidget {
  const MilkProductionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context).textTheme;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Milk Production', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        actions: [
          TextButton.icon(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MilkAnalyticsScreen())),
            icon: const Icon(Icons.bar_chart_rounded, size: 18),
            label: Text('Analytics', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
          ),
          const SizedBox(width: 8),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showBulkEntrySheet(context),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text('Record Yield', style: GoogleFonts.inter(fontWeight: FontWeight.w600, color: Colors.white)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Today summary
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                boxShadow: AppColors.cardShadow,
              ),
              child: Column(
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('52.0', style: GoogleFonts.poppins(fontSize: 44, fontWeight: FontWeight.w700, color: AppColors.primary, height: 1)),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 6, left: 4),
                        child: Text('Litres today', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(color: AppColors.success.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(20)),
                        child: Row(mainAxisSize: MainAxisSize.min, children: [
                          const Icon(Icons.trending_up_rounded, size: 14, color: AppColors.success),
                          const SizedBox(width: 4),
                          Text('+8%', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.success)),
                        ]),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(color: AppColors.borderLight),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: _buildSlot('Morning', '26.0 L', Icons.wb_sunny_outlined, AppColors.warning)),
                      Container(width: 1, height: 34, color: AppColors.borderLight),
                      Expanded(child: _buildSlot('Evening', '26.0 L', Icons.nightlight_outlined, const Color(0xFF5B6ABF))),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Per animal yields
            Text('Today\'s Animal Yields', style: theme.headlineMedium),
            const SizedBox(height: 14),
            ..._buildAnimalYields(),
          ],
        ),
      ),
    );
  }

  Widget _buildSlot(String label, String value, IconData icon, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon, size: 18, color: color),
        const SizedBox(width: 8),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: GoogleFonts.inter(fontSize: 12, color: AppColors.textTertiary)),
          Text(value, style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
        ]),
      ],
    );
  }

  List<Widget> _buildAnimalYields() {
    final data = [
      {'name': 'Lakshmi', 'tag': 'GIR-001', 'morning': '6.5', 'evening': '5.8'},
      {'name': 'Gauri', 'tag': 'GIR-003', 'morning': '5.2', 'evening': '4.9'},
      {'name': 'Nandini', 'tag': 'SAH-005', 'morning': '7.0', 'evening': '6.5'},
      {'name': 'Surabhi', 'tag': 'SAH-007', 'morning': '4.8', 'evening': '5.0'},
      {'name': 'Rohini', 'tag': 'SAH-009', 'morning': '2.5', 'evening': '3.8'},
    ];
    return data.map((d) {
      final total = (double.parse(d['morning']!) + double.parse(d['evening']!));
      return Container(
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
              decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(12)),
              child: Center(child: Text(d['name']![0], style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.primary))),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(d['name']!, style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                Text('${d['tag']} • M: ${d['morning']}L  E: ${d['evening']}L', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textTertiary)),
              ]),
            ),
            Text('${total.toStringAsFixed(1)} L', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.primary)),
          ],
        ),
      );
    }).toList();
  }

  void _showBulkEntrySheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        height: MediaQuery.of(context).size.height * 0.6,
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2)))),
              const SizedBox(height: 20),
              Text('Record Milk Yield', style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Text('Enter the morning or evening yield for an animal.', style: GoogleFonts.inter(fontSize: 14, color: AppColors.textSecondary)),
              const SizedBox(height: 24),
              Text('Animal Tag', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              TextField(
                style: GoogleFonts.inter(fontSize: 15),
                decoration: const InputDecoration(hintText: 'e.g. GIR-001'),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('Morning (L)', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      TextField(
                        keyboardType: TextInputType.number,
                        style: GoogleFonts.inter(fontSize: 15),
                        decoration: const InputDecoration(hintText: '0.0'),
                      ),
                    ]),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('Evening (L)', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      TextField(
                        keyboardType: TextInputType.number,
                        style: GoogleFonts.inter(fontSize: 15),
                        decoration: const InputDecoration(hintText: '0.0'),
                      ),
                    ]),
                  ),
                ],
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Save Record'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════
// MILK ANALYTICS SCREEN
// ═══════════════════════════════════════════════
class MilkAnalyticsScreen extends StatelessWidget {
  const MilkAnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Milk Analytics', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Weekly Trend Chart
            Text('Weekly Production Trend', style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 16),
            Container(
              height: 220,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                boxShadow: AppColors.cardShadow,
              ),
              child: LineChart(
                LineChartData(
                  gridData: FlGridData(
                    show: true,
                    drawVerticalLine: false,
                    horizontalInterval: 10,
                    getDrawingHorizontalLine: (_) => FlLine(color: AppColors.borderLight, strokeWidth: 1),
                  ),
                  titlesData: FlTitlesData(
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 28,
                        getTitlesWidget: (v, _) {
                          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                          if (v.toInt() >= 0 && v.toInt() < days.length) {
                            return Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Text(days[v.toInt()], style: GoogleFonts.inter(fontSize: 11, color: AppColors.textTertiary)),
                            );
                          }
                          return const SizedBox.shrink();
                        },
                      ),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 32,
                        getTitlesWidget: (v, _) => Text('${v.toInt()}', style: GoogleFonts.inter(fontSize: 11, color: AppColors.textTertiary)),
                      ),
                    ),
                  ),
                  borderData: FlBorderData(show: false),
                  lineBarsData: [
                    LineChartBarData(
                      spots: const [
                        FlSpot(0, 48), FlSpot(1, 50), FlSpot(2, 45), FlSpot(3, 52),
                        FlSpot(4, 55), FlSpot(5, 51), FlSpot(6, 52),
                      ],
                      isCurved: true,
                      color: AppColors.primary,
                      barWidth: 3,
                      dotData: FlDotData(
                        show: true,
                        getDotPainter: (_, _, _, _) => FlDotCirclePainter(radius: 4, color: AppColors.primary, strokeColor: Colors.white, strokeWidth: 2),
                      ),
                      belowBarData: BarAreaData(
                        show: true,
                        color: AppColors.primary.withValues(alpha: 0.06),
                      ),
                    ),
                  ],
                  minY: 30,
                  maxY: 65,
                ),
              ),
            ),
            const SizedBox(height: 28),

            // Monthly Comparison
            Text('Monthly Comparison', style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 16),
            Container(
              height: 220,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                boxShadow: AppColors.cardShadow,
              ),
              child: BarChart(
                BarChartData(
                  gridData: FlGridData(
                    show: true,
                    drawVerticalLine: false,
                    horizontalInterval: 300,
                    getDrawingHorizontalLine: (_) => FlLine(color: AppColors.borderLight, strokeWidth: 1),
                  ),
                  titlesData: FlTitlesData(
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 28,
                        getTitlesWidget: (v, _) {
                          const months = ['Jan', 'Feb', 'Mar'];
                          if (v.toInt() >= 0 && v.toInt() < months.length) {
                            return Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Text(months[v.toInt()], style: GoogleFonts.inter(fontSize: 11, color: AppColors.textTertiary)),
                            );
                          }
                          return const SizedBox.shrink();
                        },
                      ),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 36,
                        getTitlesWidget: (v, _) => Text('${v.toInt()}', style: GoogleFonts.inter(fontSize: 11, color: AppColors.textTertiary)),
                      ),
                    ),
                  ),
                  borderData: FlBorderData(show: false),
                  barGroups: [
                    BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: 1420, color: AppColors.primaryLight, width: 28, borderRadius: BorderRadius.circular(6))]),
                    BarChartGroupData(x: 1, barRods: [BarChartRodData(toY: 1380, color: AppColors.primaryLight, width: 28, borderRadius: BorderRadius.circular(6))]),
                    BarChartGroupData(x: 2, barRods: [BarChartRodData(toY: 1540, color: AppColors.primary, width: 28, borderRadius: BorderRadius.circular(6))]),
                  ],
                  maxY: 1800,
                ),
              ),
            ),
            const SizedBox(height: 28),

            // Top producers
            Text('Top Producers', style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 14),
            _buildTopProducer(1, 'Nandini', 'SAH-005', '13.5 L/day', AppColors.accent),
            _buildTopProducer(2, 'Lakshmi', 'GIR-001', '12.3 L/day', AppColors.textSecondary),
            _buildTopProducer(3, 'Surabhi', 'SAH-007', '9.8 L/day', const Color(0xFFCD7F32)),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildTopProducer(int rank, String name, String tag, String milkYield, Color medalColor) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(14), boxShadow: AppColors.cardShadow),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(color: medalColor.withValues(alpha: 0.1), shape: BoxShape.circle),
            child: Center(child: Text('#$rank', style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w700, color: medalColor))),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(name, style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              Text(tag, style: GoogleFonts.inter(fontSize: 12, color: AppColors.textTertiary)),
            ]),
          ),
          Text(milkYield, style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary)),
        ],
      ),
    );
  }
}
