using Microsoft.EntityFrameworkCore;
using Puzzle.Application.Common;
using Puzzle.Application.DTOs;
using Puzzle.Application.Interfaces;
using Puzzle.Domain.Entities;

namespace Puzzle.Application.Services;

public class PaymentService
{
    private readonly IApplicationDbContext _context;

    public PaymentService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaymentDto> AddClientPayment(CreateClientPaymentRequest request)
    {
        var clientExists = await _context.Clients.AnyAsync(c => c.Id == request.ClientId);
        if (!clientExists)
            throw AppException.NotFound("Client", request.ClientId);

        var payment = new ClientPayment
        {
            ClientId = request.ClientId,
            Amount = request.Amount,
            PaymentDate = DateTime.UtcNow,
            Notes = request.Notes
        };

        _context.ClientPayments.Add(payment);
        await _context.SaveChangesAsync();

        return new PaymentDto(payment.Id, payment.Amount, payment.PaymentDate, payment.Notes);
    }

    public async Task<PaymentDto> AddSupplierPayment(CreateSupplierPaymentRequest request)
    {
        var supplierExists = await _context.Suppliers.AnyAsync(s => s.Id == request.SupplierId);
        if (!supplierExists)
            throw AppException.NotFound("Supplier", request.SupplierId);

        var payment = new SupplierPayment
        {
            SupplierId = request.SupplierId,
            Amount = request.Amount,
            PaymentDate = DateTime.UtcNow,
            Notes = request.Notes
        };

        _context.SupplierPayments.Add(payment);
        await _context.SaveChangesAsync();

        return new PaymentDto(payment.Id, payment.Amount, payment.PaymentDate, payment.Notes);
    }
}
