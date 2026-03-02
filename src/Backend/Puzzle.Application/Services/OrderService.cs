using Microsoft.EntityFrameworkCore;
using Puzzle.Application.Common;
using Puzzle.Application.DTOs;
using Puzzle.Application.Interfaces;
using Puzzle.Domain.Entities;
using Puzzle.Domain.Enums;

namespace Puzzle.Application.Services;

public class OrderService
{
    private readonly IApplicationDbContext _context;

    public OrderService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<OrderDto>> GetAll(string? search, int page = 1, int pageSize = 20)
    {
        var query = _context.Orders
            .Include(o => o.Client)
            .Include(o => o.Payments)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(o =>
                o.OrderNumber.ToLower().Contains(term) ||
                (o.Client != null && o.Client.Name.ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(o => o.OrderDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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

        return new PaginatedResult<OrderDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<OrderDetailDto> GetById(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Client)
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Payments)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id)
            ?? throw AppException.NotFound("Order", id);

        return MapToDetailDto(order);
    }

    public async Task<OrderDetailDto> Create(CreateOrderRequest request)
    {
        var today = DateTime.UtcNow.ToString("yyyyMMdd");
        var todayCount = await _context.Orders
            .CountAsync(o => o.OrderNumber.StartsWith($"ORD-{today}"));
        var orderNumber = $"ORD-{today}-{todayCount + 1}";

        var order = new Order
        {
            OrderNumber = orderNumber,
            ClientId = request.ClientId,
            OrderDate = DateTime.UtcNow,
            Status = OrderStatus.Pending,
            Discount = request.Discount,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        decimal subTotal = 0;

        foreach (var itemRequest in request.Items)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == itemRequest.ProductId)
                ?? throw AppException.BadRequest($"Product with ID {itemRequest.ProductId} was not found.");

            if (product.Stock < itemRequest.Quantity)
                throw AppException.BadRequest($"Insufficient stock for product '{product.Name}'. Available: {product.Stock}, Requested: {itemRequest.Quantity}.");

            product.Stock -= itemRequest.Quantity;

            var itemTotal = itemRequest.Quantity * itemRequest.UnitPrice;
            subTotal += itemTotal;

            order.Items.Add(new OrderItem
            {
                ProductId = itemRequest.ProductId,
                Quantity = itemRequest.Quantity,
                UnitPrice = itemRequest.UnitPrice,
                Total = itemTotal,
                IsReturned = false
            });
        }

        order.SubTotal = subTotal;
        order.Total = subTotal - request.Discount;

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        var savedOrder = await _context.Orders
            .Include(o => o.Client)
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Payments)
            .FirstAsync(o => o.Id == order.Id);

        return MapToDetailDto(savedOrder);
    }

    public async Task UpdateStatus(int id, UpdateOrderStatusRequest request)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == id)
            ?? throw AppException.NotFound("Order", id);

        order.Status = request.Status;
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task<OrderDetailDto> ReturnItems(int id, ReturnItemsRequest request)
    {
        var order = await _context.Orders
            .Include(o => o.Client)
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Payments)
            .FirstOrDefaultAsync(o => o.Id == id)
            ?? throw AppException.NotFound("Order", id);

        foreach (var itemId in request.OrderItemIds)
        {
            var item = order.Items.FirstOrDefault(i => i.Id == itemId)
                ?? throw AppException.BadRequest($"Order item with ID {itemId} was not found in this order.");

            if (!item.Product.IsReturnable)
                throw AppException.BadRequest($"Product '{item.Product.Name}' is not returnable.");

            if (item.IsReturned)
                throw AppException.BadRequest($"Order item with ID {itemId} has already been returned.");

            item.IsReturned = true;
            item.ReturnPrice = item.Product.ReturnPrice;

            item.Product.Stock += item.Quantity;
        }

        var returnTotal = order.Items
            .Where(i => i.IsReturned && i.ReturnPrice.HasValue)
            .Sum(i => i.ReturnPrice!.Value);

        order.Total = order.SubTotal - order.Discount - returnTotal;
        order.UpdatedAt = DateTime.UtcNow;

        var allReturned = order.Items.All(i => i.IsReturned);
        order.Status = allReturned ? OrderStatus.FullReturn : OrderStatus.PartialReturn;

        await _context.SaveChangesAsync();

        return MapToDetailDto(order);
    }

    public async Task<PaymentDto> AddPayment(int id, CreatePaymentRequest request)
    {
        var orderExists = await _context.Orders.AnyAsync(o => o.Id == id);
        if (!orderExists)
            throw AppException.NotFound("Order", id);

        var payment = new OrderPayment
        {
            OrderId = id,
            Amount = request.Amount,
            PaymentDate = DateTime.UtcNow,
            Notes = request.Notes
        };

        _context.OrderPayments.Add(payment);
        await _context.SaveChangesAsync();

        return new PaymentDto(payment.Id, payment.Amount, payment.PaymentDate, payment.Notes);
    }

    public async Task<List<PaymentDto>> GetPayments(int id)
    {
        var orderExists = await _context.Orders.AnyAsync(o => o.Id == id);
        return !orderExists
            ? throw AppException.NotFound("Order", id)
            : await _context.OrderPayments
            .AsNoTracking()
            .Where(p => p.OrderId == id)
            .OrderByDescending(p => p.PaymentDate)
            .Select(p => new PaymentDto(p.Id, p.Amount, p.PaymentDate, p.Notes))
            .ToListAsync();
    }

    public async Task RemovePayment(int orderId, int paymentId)
    {
        var payment = await _context.OrderPayments
            .FirstOrDefaultAsync(p => p.Id == paymentId && p.OrderId == orderId)
            ?? throw AppException.NotFound("Payment", paymentId);

        _context.OrderPayments.Remove(payment);
        await _context.SaveChangesAsync();
    }

    private static OrderDetailDto MapToDetailDto(Order order)
    {
        var paidAmount = order.Payments.Sum(p => p.Amount);

        var items = order.Items.Select(i => new OrderItemDto(
            i.Id,
            i.ProductId,
            i.Product.Name,
            i.Quantity,
            i.UnitPrice,
            i.Total,
            i.IsReturned,
            i.ReturnPrice)).ToList();

        var payments = order.Payments.Select(p => new PaymentDto(
            p.Id,
            p.Amount,
            p.PaymentDate,
            p.Notes)).ToList();

        return new OrderDetailDto(
            order.Id,
            order.OrderNumber,
            order.ClientId,
            order.Client?.Name,
            order.OrderDate,
            order.Status,
            order.Discount,
            order.SubTotal,
            order.Total,
            paidAmount,
            order.Total - paidAmount,
            order.Notes,
            items,
            payments);
    }
}
