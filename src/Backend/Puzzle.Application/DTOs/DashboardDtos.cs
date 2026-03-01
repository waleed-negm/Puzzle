namespace Puzzle.Application.DTOs;

public record DashboardDto(
    int TotalProducts,
    int TotalOrders,
    int TotalClients,
    int TotalSuppliers,
    int TodayOrders,
    decimal TodaySales,
    List<OrderDto> RecentOrders);
