import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../design_system/theme/app_colors.dart';
import '../../core/widgets/shimmer_loader.dart';
import '../../core/widgets/app_error_widget.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/dashboard_provider.dart';

class MainDashboardScreen extends ConsumerStatefulWidget {
  const MainDashboardScreen({super.key});

  @override
  ConsumerState<MainDashboardScreen> createState() => _MainDashboardScreenState();
}

class _MainDashboardScreenState extends ConsumerState<MainDashboardScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: _buildBody(),
      drawer: _buildDrawer(context),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildBody() {
    return CustomScrollView(
      slivers: [
        // Collapsing Header
        SliverAppBar(
          expandedHeight: 190,
          floating: false,
          pinned: true,
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          leading: Builder(
            builder: (ctx) => IconButton(
              icon: const Icon(Icons.menu_rounded, color: Colors.white),
              onPressed: () => Scaffold.of(ctx).openDrawer(),
            ),
          ),
          actions: [
            IconButton(
              icon: Stack(
                children: [
                  const Icon(
                    Icons.notifications_outlined,
                    color: Colors.white,
                    size: 24,
                  ),
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppColors.accentLight,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                ],
              ),
              onPressed: () {},
            ),
            const SizedBox(width: 8),
          ],
          flexibleSpace: FlexibleSpaceBar(
            background: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppColors.primaryDark, AppColors.primary],
                ),
              ),
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 60, 20, 20),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Text(
                              _greeting,
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                color: Colors.white70,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              ref.watch(authProvider).userName ?? 'User',
                              style: GoogleFonts.poppins(
                                fontSize: 24,
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              ref.watch(authProvider).activeGaushala?.name ?? 'My Gaushala',
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                color: Colors.white60,
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Cow icon in header
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Padding(
                            padding: const EdgeInsets.all(6),
                            child: Image.asset(
                              'assets/images/cow_icon.png',
                              fit: BoxFit.contain,
                              errorBuilder: (_, _, _) => const Icon(
                                Icons.cruelty_free,
                                size: 32,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),

        // Body
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // --- STAT CARDS WITH ILLUSTRATIONS ---
                _buildIllustrationStatCards(),
                const SizedBox(height: 28),

                // --- TODAY'S PRODUCTION ---
                _buildSectionHeader("Today's Production"),
                const SizedBox(height: 14),
                _buildProductionCard(),
                const SizedBox(height: 28),

                // --- CATTLE OVERVIEW ---
                _buildSectionHeader('Cattle Overview', action: 'View All'),
                const SizedBox(height: 14),
                _buildCattleOverview(),
                const SizedBox(height: 28),

                // --- QUICK ACTIONS ---
                _buildSectionHeader('Quick Actions'),
                const SizedBox(height: 14),
                _buildQuickActions(),
                const SizedBox(height: 28),

                // --- ALERTS ---
                _buildSectionHeader('Alerts', action: 'View All'),
                const SizedBox(height: 14),
                _buildAlertsSection(),
                const SizedBox(height: 28),

                // --- OPERATIONS ---
                _buildSectionHeader('Operations'),
                const SizedBox(height: 14),
                _buildOperationsList(),
                const SizedBox(height: 28),

                // --- PHOTO GALLERY ---
                _buildSectionHeader('Photo Gallery', action: 'View All'),
                const SizedBox(height: 14),
                _buildPhotoGallery(),
                const SizedBox(height: 28),

                // --- VIDEO GALLERY ---
                _buildSectionHeader('Video Gallery', action: 'View All'),
                const SizedBox(height: 14),
                _buildVideoGallery(),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════
  // SECTION HEADER
  // ═══════════════════════════════════════════════
  Widget _buildSectionHeader(String title, {String? action}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        if (action != null)
          GestureDetector(
            onTap: () {},
            child: Text(
              action,
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.accent,
              ),
            ),
          ),
      ],
    );
  }

  // ═══════════════════════════════════════════════
  // STAT CARDS WITH COW/BULL ILLUSTRATIONS
  // ═══════════════════════════════════════════════
  /// Time-of-day greeting
  String get _greeting {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning,';
    if (hour < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  }

  Widget _buildIllustrationStatCards() {
    final summaryAsync = ref.watch(dashboardSummaryProvider);

    return summaryAsync.when(
      loading: () => const ShimmerLoader.cards(itemCount: 2, itemHeight: 140),
      error: (err, _) => AppErrorWidget(
        message: 'Failed to load stats',
        detail: err.toString(),
        onRetry: () => ref.invalidate(dashboardSummaryProvider),
      ),
      data: (summary) => Row(
        children: [
          // All Cow Card
          Expanded(
            child: Container(
              height: 140,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(20),
                boxShadow: AppColors.cardShadow,
              ),
              child: Stack(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const FaIcon(
                              FontAwesomeIcons.cow,
                              size: 12,
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'All Cow',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        '${summary.cows.total}'.padLeft(2, '0'),
                        style: GoogleFonts.poppins(
                          fontSize: 38,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                          height: 1,
                        ),
                      ),
                    ],
                  ),
                  Positioned(
                    right: -4,
                    bottom: -8,
                    child: Image.asset(
                      'assets/images/cow_illustration.png',
                      height: 80,
                      fit: BoxFit.contain,
                      errorBuilder: (_, _, _) => const SizedBox.shrink(),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 14),
          // All Bull Card
          Expanded(
            child: Container(
              height: 140,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(20),
                boxShadow: AppColors.cardShadow,
              ),
              child: Stack(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: AppColors.accent.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const FaIcon(
                              FontAwesomeIcons.horse,
                              size: 12,
                              color: AppColors.accent,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'All Bull',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        '${summary.bulls.total}'.padLeft(2, '0'),
                        style: GoogleFonts.poppins(
                          fontSize: 38,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                          height: 1,
                        ),
                      ),
                    ],
                  ),
                  Positioned(
                    right: -2,
                    bottom: -8,
                    child: Image.asset(
                      'assets/images/bull_illustration.png',
                      height: 80,
                      fit: BoxFit.contain,
                      errorBuilder: (_, _, _) => const SizedBox.shrink(),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════
  // PRODUCTION CARD
  // ═══════════════════════════════════════════════
  Widget _buildProductionCard() {
    return Container(
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
              Text(
                '52.0',
                style: GoogleFonts.poppins(
                  fontSize: 44,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                  height: 1,
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(bottom: 6, left: 4),
                child: Text(
                  'Ltr',
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 5,
                ),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.trending_up_rounded,
                      size: 14,
                      color: AppColors.success,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '+8%',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.success,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Divider(color: AppColors.borderLight),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildProductionSlot(
                  'Morning',
                  '26.0 L',
                  Icons.wb_sunny_outlined,
                  const Color(0xFFE5A100),
                ),
              ),
              Container(width: 1, height: 40, color: AppColors.borderLight),
              Expanded(
                child: _buildProductionSlot(
                  'Evening',
                  '26.0 L',
                  Icons.nightlight_outlined,
                  const Color(0xFF5B6ABF),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProductionSlot(
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon, size: 18, color: color),
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AppColors.textTertiary,
                fontWeight: FontWeight.w500,
              ),
            ),
            Text(
              value,
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════
  // CATTLE OVERVIEW
  // ═══════════════════════════════════════════════
  Widget _buildCattleOverview() {
    final summaryAsync = ref.watch(dashboardSummaryProvider);

    return summaryAsync.when(
      loading: () => const SizedBox(
        height: 88,
        child: ShimmerLoader.cards(itemCount: 4, itemHeight: 88),
      ),
      error: (_, __) => const SizedBox.shrink(),
      data: (summary) => SizedBox(
        height: 88,
        child: ListView(
          scrollDirection: Axis.horizontal,
          children: [
            _buildCattleChip('Lactating', '${summary.cows.lactating}'.padLeft(2, '0'), AppColors.success),
            _buildCattleChip('Heifer', '${summary.cows.heifer}'.padLeft(2, '0'), AppColors.info),
            _buildCattleChip('Pregnant', '${summary.cows.pregnant}'.padLeft(2, '0'), const Color(0xFF8B5CF6)),
            _buildCattleChip('Dry', '${summary.cows.dryOff}'.padLeft(2, '0'), AppColors.warning),
          ],
        ),
      ),
    );
  }

  Widget _buildCattleChip(String label, String count, Color color) {
    return Container(
      width: 100,
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.symmetric(vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            count,
            style: GoogleFonts.poppins(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: color,
              height: 1,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════
  // QUICK ACTIONS GRID
  // ═══════════════════════════════════════════════
  Widget _buildQuickActions() {
    final actions = [
      _QuickAction(
        'Heat Record',
        FontAwesomeIcons.fire,
        const Color(0xFFE84393),
        '/breeding',
      ),
      _QuickAction(
        'Conception',
        FontAwesomeIcons.baby,
        const Color(0xFF8B5CF6),
        '/breeding',
      ),
      _QuickAction(
        'Medical',
        FontAwesomeIcons.stethoscope,
        const Color(0xFFEF4444),
        '/health',
      ),
      _QuickAction('Vaccination', FontAwesomeIcons.syringe, AppColors.info, '/health'),
      _QuickAction('Deworming', FontAwesomeIcons.capsules, AppColors.success, '/health'),
      _QuickAction('Lab Test', FontAwesomeIcons.flask, const Color(0xFF4F46E5), '/health'),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 1.05,
      ),
      itemCount: actions.length,
      itemBuilder: (_, i) {
        final item = actions[i];
        return Container(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(14),
            boxShadow: AppColors.cardShadow,
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () => Navigator.pushNamed(context, item.route),
              borderRadius: BorderRadius.circular(14),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: item.color.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Center(
                      child: FaIcon(item.icon, size: 17, color: item.color),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    item.label,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  // ═══════════════════════════════════════════════
  // ALERTS SECTION
  // ═══════════════════════════════════════════════
  Widget _buildAlertsSection() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        children: [
          _buildAlertRow(
            'Hospitalization',
            '4 animals need attention',
            Icons.local_hospital_outlined,
            AppColors.destructive,
            '4',
            showDivider: true,
          ),
          _buildAlertRow(
            'Vaccination Due',
            '6 animals pending vaccination',
            Icons.vaccines_outlined,
            AppColors.warning,
            '6',
            showDivider: true,
          ),
          _buildAlertRow(
            'Heat Detection',
            '2 cows showing signs',
            Icons.thermostat_outlined,
            const Color(0xFFE84393),
            '2',
            showDivider: true,
          ),
          _buildAlertRow(
            'Low Milk Yield',
            '3 cows below average',
            Icons.trending_down_rounded,
            AppColors.info,
            '3',
            showDivider: false,
          ),
        ],
      ),
    );
  }

  Widget _buildAlertRow(
    String title,
    String subtitle,
    IconData icon,
    Color color,
    String badge, {
    required bool showDivider,
  }) {
    return Column(
      children: [
        Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () {},
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Center(child: Icon(icon, size: 18, color: color)),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          subtitle,
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: color,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      badge,
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        if (showDivider) const Divider(height: 0, indent: 72, endIndent: 18),
      ],
    );
  }

  // ═══════════════════════════════════════════════
  // OPERATIONS LIST
  // ═══════════════════════════════════════════════
  Widget _buildOperationsList() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        children: [
          _buildOperationRow(
            'Distribute Milk',
            'Track delivery routes',
            FontAwesomeIcons.truckFast,
            AppColors.accent,
            showDivider: true,
          ),
          _buildOperationRow(
            'Reports',
            'View gaushala metrics',
            FontAwesomeIcons.chartColumn,
            AppColors.info,
            showDivider: true,
          ),
          _buildOperationRow(
            'Sell Records',
            'Sale history logs',
            FontAwesomeIcons.tags,
            AppColors.warning,
            showDivider: true,
          ),
          _buildOperationRow(
            'Donations',
            'Charity logs',
            FontAwesomeIcons.handHoldingHeart,
            AppColors.success,
            showDivider: true,
          ),
          _buildOperationRow(
            'Mortality',
            'Death records',
            FontAwesomeIcons.fileLines,
            AppColors.textTertiary,
            showDivider: false,
          ),
        ],
      ),
    );
  }

  Widget _buildOperationRow(
    String title,
    String subtitle,
    dynamic icon,
    Color color, {
    required bool showDivider,
  }) {
    return Column(
      children: [
        Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () {},
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Center(child: FaIcon(icon, size: 16, color: color)),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          subtitle,
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(
                    Icons.chevron_right_rounded,
                    size: 20,
                    color: AppColors.textTertiary,
                  ),
                ],
              ),
            ),
          ),
        ),
        if (showDivider) const Divider(height: 0, indent: 72, endIndent: 18),
      ],
    );
  }

  // ═══════════════════════════════════════════════
  // PHOTO GALLERY
  // ═══════════════════════════════════════════════
  Widget _buildPhotoGallery() {
    return SizedBox(
      height: 140,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: 5,
        itemBuilder: (_, i) {
          final labels = [
            'Gir Cow',
            'Sahiwal',
            'Morning Feed',
            'Gaushala',
            'New Calf',
          ];
          final icons = [
            Icons.cruelty_free,
            Icons.cruelty_free,
            Icons.grass,
            Icons.warehouse_outlined,
            Icons.child_friendly_outlined,
          ];
          return Container(
            width: 130,
            margin: const EdgeInsets.only(right: 12),
            decoration: BoxDecoration(
              color: AppColors.surfaceTint,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                Expanded(
                  child: Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.06),
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(15),
                      ),
                    ),
                    child: Icon(
                      icons[i],
                      size: 36,
                      color: AppColors.primary.withValues(alpha: 0.4),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 10,
                  ),
                  child: Text(
                    labels[i],
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  // ═══════════════════════════════════════════════
  // VIDEO GALLERY
  // ═══════════════════════════════════════════════
  Widget _buildVideoGallery() {
    return SizedBox(
      height: 130,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: 4,
        itemBuilder: (_, i) {
          final labels = [
            'Milking Process',
            'Vaccination Day',
            'Calf Birth',
            'Gaushala Tour',
          ];
          final durations = ['2:45', '5:12', '1:30', '8:20'];
          return Container(
            width: 170,
            margin: const EdgeInsets.only(right: 12),
            decoration: BoxDecoration(
              color: AppColors.surfaceTint,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                Expanded(
                  child: Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppColors.primaryDark.withValues(alpha: 0.08),
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(15),
                      ),
                    ),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        Icon(
                          Icons.videocam_outlined,
                          size: 32,
                          color: AppColors.primary.withValues(alpha: 0.3),
                        ),
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.85),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.play_arrow_rounded,
                            size: 20,
                            color: Colors.white,
                          ),
                        ),
                        Positioned(
                          right: 8,
                          bottom: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.6),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              durations[i],
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 10,
                  ),
                  child: Text(
                    labels[i],
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  // ═══════════════════════════════════════════════
  // BOTTOM NAV
  // ═══════════════════════════════════════════════
  Widget _buildBottomNav() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(0, Icons.home_outlined, Icons.home_rounded, 'Home'),
              _buildNavItem(
                1,
                Icons.cruelty_free_outlined,
                Icons.cruelty_free,
                'Cattle',
              ),
              _buildNavItem(
                2,
                Icons.favorite_outline_rounded,
                Icons.favorite_rounded,
                'Health',
              ),
              _buildNavItem(
                3,
                Icons.bar_chart_outlined,
                Icons.bar_chart_rounded,
                'Reports',
              ),
              _buildNavItem(
                4,
                Icons.person_outline_rounded,
                Icons.person_rounded,
                'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    int index,
    IconData icon,
    IconData activeIcon,
    String label,
  ) {
    final isActive = _currentIndex == index;
    return GestureDetector(
      onTap: () {
        if (index == 2) {
          Navigator.pushNamed(context, '/health');
        } else if (index == 3) {
          Navigator.pushNamed(context, '/production');
        } else {
          setState(() => _currentIndex = index);
        }
      },
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 64,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isActive ? activeIcon : icon,
              size: 24,
              color: isActive ? AppColors.primary : AppColors.textTertiary,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                color: isActive ? AppColors.primary : AppColors.textTertiary,
              ),
            ),
            const SizedBox(height: 4),
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: isActive ? 20 : 0,
              height: 3,
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════
  // DRAWER
  // ═══════════════════════════════════════════════
  Widget _buildDrawer(BuildContext context) {
    return Drawer(
      backgroundColor: AppColors.surface,
      child: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Profile Header
              Container(
                padding: const EdgeInsets.all(24),
                child: Row(
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: Image.asset(
                          'assets/images/cow_icon.png',
                          fit: BoxFit.cover,
                          errorBuilder: (_, _, _) => const Icon(
                            Icons.person,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            ref.watch(authProvider).userName ?? 'User',
                            style: GoogleFonts.poppins(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            ref.watch(authProvider).activeGaushala?.name ?? '',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(height: 0),

              _buildDrawerSection('Account', [
                _DrawerEntry(Icons.home_outlined, 'Home'),
                _DrawerEntry(Icons.lock_outline_rounded, 'Change Password'),
                _DrawerEntry(Icons.translate_rounded, 'Language'),
                _DrawerEntry(Icons.shield_outlined, 'Privacy Policy'),
                _DrawerEntry(Icons.share_outlined, 'Share App'),
              ]),
              _buildDrawerSection('Management', [
                _DrawerEntry(Icons.people_outline_rounded, 'User Management'),
                _DrawerEntry(Icons.cruelty_free_outlined, 'Cow Groups'),
                _DrawerEntry(Icons.science_outlined, 'AI Bull Registry'),
                _DrawerEntry(Icons.swap_horiz_rounded, 'Transfer History'),
                _DrawerEntry(Icons.local_shipping_outlined, 'Distribution'),
              ]),
              _buildDrawerSection('Support', [
                _DrawerEntry(Icons.info_outline_rounded, 'About'),
                _DrawerEntry(Icons.menu_book_outlined, 'Documentation'),
                _DrawerEntry(Icons.chat_bubble_outline_rounded, 'Feedback'),
                _DrawerEntry(Icons.headset_mic_outlined, 'Contact Us'),
              ]),

              const Divider(height: 0),
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                child: ListTile(
                  leading: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: AppColors.destructive.withValues(alpha: 0.06),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.logout_rounded,
                      size: 18,
                      color: AppColors.destructive,
                    ),
                  ),
                  title: Text(
                    'Logout',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.destructive,
                    ),
                  ),
                  onTap: () async {
                    final confirm = await showDialog<bool>(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Logout'),
                        content: const Text('Are you sure you want to logout?'),
                        actions: [
                          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                          TextButton(
                            onPressed: () => Navigator.pop(ctx, true),
                            child: Text('Logout', style: TextStyle(color: AppColors.destructive)),
                          ),
                        ],
                      ),
                    );
                    if (confirm == true && mounted) {
                      await ref.read(authProvider.notifier).logout();
                      if (mounted) Navigator.pushReplacementNamed(context, '/auth');
                    }
                  },
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDrawerSection(String title, List<_DrawerEntry> entries) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
          child: Text(
            title.toUpperCase(),
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: AppColors.textTertiary,
              letterSpacing: 1.2,
            ),
          ),
        ),
        ...entries.map(
          (e) => Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: ListTile(
              dense: true,
              leading: Icon(e.icon, size: 20, color: AppColors.textSecondary),
              title: Text(
                e.label,
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                ),
              ),
              trailing: const Icon(
                Icons.chevron_right_rounded,
                size: 18,
                color: AppColors.textTertiary,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              onTap: () {},
            ),
          ),
        ),
      ],
    );
  }
}

// ═══════════════════════════════════════════════
// HELPER CLASSES
// ═══════════════════════════════════════════════
class _QuickAction {
  final String label;
  final dynamic icon;
  final Color color;
  final String route;
  const _QuickAction(this.label, this.icon, this.color, this.route);
}

class _DrawerEntry {
  final IconData icon;
  final String label;
  const _DrawerEntry(this.icon, this.label);
}
