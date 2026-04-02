import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

/// Professional shimmer/skeleton loading widget.
/// Use instead of a generic spinner for all list and card loading states.
class ShimmerLoader extends StatelessWidget {
  final int itemCount;
  final double itemHeight;
  final EdgeInsetsGeometry padding;
  final ShimmerType type;

  const ShimmerLoader({
    super.key,
    this.itemCount = 5,
    this.itemHeight = 80,
    this.padding = const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
    this.type = ShimmerType.list,
  });

  /// Card-style shimmer for dashboard stat cards
  const ShimmerLoader.cards({
    super.key,
    this.itemCount = 4,
    this.itemHeight = 120,
    this.padding = const EdgeInsets.all(16),
  }) : type = ShimmerType.cards;

  /// Single detail-view shimmer
  const ShimmerLoader.detail({
    super.key,
    this.itemCount = 1,
    this.itemHeight = 300,
    this.padding = const EdgeInsets.all(16),
  }) : type = ShimmerType.detail;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final baseColor = isDark ? Colors.grey[800]! : Colors.grey[300]!;
    final highlightColor = isDark ? Colors.grey[700]! : Colors.grey[100]!;

    return Shimmer.fromColors(
      baseColor: baseColor,
      highlightColor: highlightColor,
      child: Padding(
        padding: padding,
        child: _buildContent(),
      ),
    );
  }

  Widget _buildContent() {
    switch (type) {
      case ShimmerType.list:
        return _buildListShimmer();
      case ShimmerType.cards:
        return _buildCardsShimmer();
      case ShimmerType.detail:
        return _buildDetailShimmer();
    }
  }

  Widget _buildListShimmer() {
    return Column(
      children: List.generate(itemCount, (index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            children: [
              // Avatar circle
              Container(
                width: 48,
                height: 48,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 12),
              // Content lines
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: double.infinity,
                      height: 14,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      width: 120,
                      height: 10,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              // Trailing chip
              Container(
                width: 60,
                height: 24,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildCardsShimmer() {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: List.generate(itemCount, (index) {
        return Container(
          width: 160,
          height: itemHeight,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
        );
      }),
    );
  }

  Widget _buildDetailShimmer() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Hero image placeholder
        Container(
          width: double.infinity,
          height: 200,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        const SizedBox(height: 16),
        // Title
        Container(
          width: 200,
          height: 20,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const SizedBox(height: 12),
        // Subtitle
        Container(
          width: 140,
          height: 14,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const SizedBox(height: 20),
        // Info rows
        ...List.generate(4, (index) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            children: [
              Container(
                width: 100,
                height: 12,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Container(
                  height: 12,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ],
          ),
        )),
      ],
    );
  }
}

enum ShimmerType { list, cards, detail }
