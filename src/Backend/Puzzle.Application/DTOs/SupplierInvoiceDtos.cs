namespace Puzzle.Application.DTOs;

public record SupplierInvoiceDto(
    int Id,
    string InvoiceNumber,
    int SupplierId,
    string SupplierName,
    DateTime InvoiceDate,
    decimal Total,
    decimal PaidAmount,
    decimal Remaining,
    string? Notes);

public record SupplierInvoiceDetailDto(
    int Id,
    string InvoiceNumber,
    int SupplierId,
    string SupplierName,
    DateTime InvoiceDate,
    decimal Total,
    decimal PaidAmount,
    decimal Remaining,
    string? Notes,
    List<SupplierInvoiceItemDto> Items,
    List<PaymentDto> Payments);

public record SupplierInvoiceItemDto(
    int Id,
    int ProductId,
    string ProductName,
    int Quantity,
    decimal CostPrice,
    decimal SellingPrice,
    decimal Total);

public record CreateSupplierInvoiceRequest(
    int SupplierId,
    string? Notes,
    List<CreateSupplierInvoiceItemRequest> Items);

public record CreateSupplierInvoiceItemRequest(
    int ProductId,
    int Quantity,
    decimal CostPrice,
    decimal SellingPrice);
