using Puzzle.Domain.Enums;

namespace Puzzle.Application.DTOs;

public record OrderDto(
    int Id,
    string OrderNumber,
    int? ClientId,
    string? ClientName,
    DateTime OrderDate,
    OrderStatus Status,
    decimal Discount,
    decimal SubTotal,
    decimal Total,
    decimal PaidAmount,
    decimal Remaining,
    string? Notes);

public record OrderDetailDto(
    int Id,
    string OrderNumber,
    int? ClientId,
    string? ClientName,
    DateTime OrderDate,
    OrderStatus Status,
    decimal Discount,
    decimal SubTotal,
    decimal Total,
    decimal PaidAmount,
    decimal Remaining,
    string? Notes,
    List<OrderItemDto> Items,
    List<PaymentDto> Payments);

public record OrderItemDto(
    int Id,
    int ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal Total,
    bool IsReturned,
    decimal? ReturnPrice);

public record CreateOrderRequest(
    int? ClientId,
    decimal Discount,
    string? Notes,
    List<CreateOrderItemRequest> Items);

public record CreateOrderItemRequest(
    int ProductId,
    int Quantity,
    decimal UnitPrice);

public record UpdateOrderStatusRequest(OrderStatus Status);

public record ReturnItemsRequest(List<int> OrderItemIds);
