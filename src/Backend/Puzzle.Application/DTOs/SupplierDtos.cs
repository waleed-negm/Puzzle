namespace Puzzle.Application.DTOs;

public record SupplierDto(int Id, string Name, string? Phone, string? Address);

public record SupplierDetailDto(
    int Id,
    string Name,
    string? Phone,
    string? Address,
    decimal TotalInvoices,
    decimal TotalPaid,
    decimal Balance);

public record CreateSupplierRequest(string Name, string? Phone, string? Address);

public record UpdateSupplierRequest(string Name, string? Phone, string? Address);
