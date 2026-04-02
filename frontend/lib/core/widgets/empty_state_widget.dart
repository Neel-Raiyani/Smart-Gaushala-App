import 'package:flutter/material.dart';

/// Professional empty state widget for lists and screens with no data.
class EmptyStateWidget extends StatelessWidget {
  final String title;
  final String? subtitle;
  final IconData icon;
  final Widget? action;

  const EmptyStateWidget({
    super.key,
    required this.title,
    this.subtitle,
    this.icon = Icons.inbox_rounded,
    this.action,
  });

  /// Empty cow/bull list
  const EmptyStateWidget.animals({
    super.key,
    this.action,
  })  : title = 'No animals found',
        subtitle = 'Register your first animal to get started',
        icon = Icons.pets_rounded;

  /// Empty health records
  const EmptyStateWidget.health({
    super.key,
    this.action,
  })  : title = 'No health records',
        subtitle = 'Health records will appear here once added',
        icon = Icons.medical_services_outlined;

  /// Empty breeding records
  const EmptyStateWidget.breeding({
    super.key,
    this.action,
  })  : title = 'No breeding records',
        subtitle = 'Start tracking breeding cycles',
        icon = Icons.favorite_border_rounded;

  /// Empty milk records
  const EmptyStateWidget.production({
    super.key,
    this.action,
  })  : title = 'No production data',
        subtitle = 'Record daily milk yields to see analytics',
        icon = Icons.water_drop_outlined;

  /// Empty alerts
  const EmptyStateWidget.alerts({
    super.key,
    this.action,
  })  : title = 'No pending alerts',
        subtitle = 'All caught up! No action items right now',
        icon = Icons.notifications_none_rounded;

  /// Empty search results
  const EmptyStateWidget.search({
    super.key,
    this.action,
  })  : title = 'No results found',
        subtitle = 'Try adjusting your search or filters',
        icon = Icons.search_off_rounded;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon with subtle background
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withValues(alpha: 0.06),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 36,
                color: theme.colorScheme.primary.withValues(alpha: 0.4),
              ),
            ),
            const SizedBox(height: 20),

            // Title
            Text(
              title,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
              ),
              textAlign: TextAlign.center,
            ),

            // Subtitle
            if (subtitle != null) ...[
              const SizedBox(height: 8),
              Text(
                subtitle!,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.45),
                ),
                textAlign: TextAlign.center,
              ),
            ],

            // Action button
            if (action != null) ...[
              const SizedBox(height: 24),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}
