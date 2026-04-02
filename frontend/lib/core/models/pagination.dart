/// Pagination wrapper matching backend response format:
/// `{ pagination: { page, limit, total, totalPages } }`
class PaginatedResponse<T> {
  final List<T> data;
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  const PaginatedResponse({
    required this.data,
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  bool get hasMore => page < totalPages;
  bool get isEmpty => data.isEmpty;

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    String dataKey,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    final pagination = json['pagination'] as Map<String, dynamic>? ?? {};
    final items = (json[dataKey] as List<dynamic>?)
            ?.map((e) => fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];

    return PaginatedResponse(
      data: items,
      page: pagination['page'] as int? ?? 1,
      limit: pagination['limit'] as int? ?? 20,
      total: pagination['total'] as int? ?? items.length,
      totalPages: pagination['totalPages'] as int? ?? 1,
    );
  }
}
