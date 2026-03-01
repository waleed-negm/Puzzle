namespace Puzzle.Application.DTOs;

public record PaymentDto(int Id, decimal Amount, DateTime PaymentDate, string? Notes);

public record CreatePaymentRequest(decimal Amount, string? Notes);

public record CreateClientPaymentRequest(int ClientId, decimal Amount, string? Notes);

public record CreateSupplierPaymentRequest(int SupplierId, decimal Amount, string? Notes);
