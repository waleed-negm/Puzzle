using Microsoft.EntityFrameworkCore;
using Puzzle.Application.DTOs;
using Puzzle.Application.Interfaces;

namespace Puzzle.Application.Services;

public class DashboardService
{
    private readonly IApplicationDbContext _context;

    public DashboardService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardDto> GetDashboard()
    {
        var totalProducts = await _context.Products.CountAsync();
        var totalOrders = await _context.Orders.CountAsync();
        var totalClients = await _context.Clients.CountAsync();
        var totalSuppliers = await _context.Suppliers.CountAsync();

        var today = DateTime.UtcNow.Date;

        var todayOrders = await _context.Orders
            .CountAsync(o => o.OrderDate.Date == today);

        var todaySales = await _context.Orders
            .Where(o => o.OrderDate.Date == today)
            .SumAsync(o => (decimal?)o.Total) ?? 0;

        var recentOrders = await _context.Orders
            .Include(o => o.Client)
            .Include(o => o.Payments)
            .AsNoTracking()
            .OrderByDescending(o => o.OrderDate)
            .Take(10)
            .Select(o => new OrderDto(
                o.Id,
                o.OrderNumber,
                o.ClientId,
                o.Client != null ? o.Client.Name : null,
                o.OrderDate,
                o.Status,
                o.Discount,
                o.SubTotal,
                o.Total,
                o.Payments.Sum(p => p.Amount),
                o.Total - o.Payments.Sum(p => p.Amount),
                o.Notes))
            .ToListAsync();

        return new DashboardDto(
            totalProducts,
            totalOrders,
            totalClients,
            totalSuppliers,
            todayOrders,
            todaySales,
            recentOrders);
    }
}
