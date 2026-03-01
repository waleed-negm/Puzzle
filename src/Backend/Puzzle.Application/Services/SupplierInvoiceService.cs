using Microsoft.EntityFrameworkCore;
using Puzzle.Application.Common;
using Puzzle.Application.DTOs;
using Puzzle.Application.Interfaces;
using Puzzle.Domain.Entities;

namespace Puzzle.Application.Services;

public class SupplierInvoiceService
{
    private readonly IApplicationDbContext _context;

    public SupplierInvoiceService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<SupplierInvoiceDto>> GetAll(int? supplierId, int page = 1, int pageSize = 20)
    {
        var query = _context.SupplierInvoices
            .Include(i => i.Supplier)
            .Include(i => i.Payments)
            .AsNoTracking()
            .AsQueryable();

        if (supplierId.HasValue)
            query = query.Where(i => i.SupplierId == supplierId.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(i => i.InvoiceDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new SupplierInvoiceDto(
                i.Id,
                i.InvoiceNumber,
                i.SupplierId,
                i.Supplier.Name,
                i.InvoiceDate,
                i.Total,
                i.Payments.Sum(p => p.Amount),
                i.Total - i.Payments.Sum(p => p.Amount),
                i.Notes))
            .ToListAsync();

        return new PaginatedResult<SupplierInvoiceDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<SupplierInvoiceDetailDto> GetById(int id)
    {
        var invoice = await _context.SupplierInvoices
            .Include(i => i.Supplier)
            .Include(i => i.Items).ThenInclude(item => item.Product)
            .Include(i => i.Payments)
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id)
            ?? throw AppException.NotFound("Supplier Invoice", id);

        return MapToDetailDto(invoice);
    }

    public async Task<SupplierInvoiceDetailDto> Create(CreateSupplierInvoiceRequest request)
    {
        var supplierExists = await _context.Suppliers.AnyAsync(s => s.Id == request.SupplierId);
        if (!supplierExists)
            throw AppException.BadRequest("The specified supplier does not exist.");

        var today = DateTime.UtcNow.ToString("yyyyMMdd");
        var todayCount = await _context.SupplierInvoices
            .CountAsync(i => i.InvoiceNumber.StartsWith($"INV-{today}"));
        var invoiceNumber = $"INV-{today}-{todayCount + 1}";

        var invoice = new SupplierInvoice
        {
            InvoiceNumber = invoiceNumber,
            SupplierId = request.SupplierId,
            InvoiceDate = DateTime.UtcNow,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        decimal total = 0;

        foreach (var itemRequest in request.Items)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == itemRequest.ProductId)
                ?? throw AppException.BadRequest($"Product with ID {itemRequest.ProductId} was not found.");

            product.Stock += itemRequest.Quantity;
            product.CostPrice = itemRequest.CostPrice;
            product.Price = itemRequest.SellingPrice;

            var itemTotal = itemRequest.Quantity * itemRequest.CostPrice;
            total += itemTotal;

            invoice.Items.Add(new SupplierInvoiceItem
            {
                ProductId = itemRequest.ProductId,
                Quantity = itemRequest.Quantity,
                CostPrice = itemRequest.CostPrice,
                SellingPrice = itemRequest.SellingPrice,
                Total = itemTotal
            });
        }

        invoice.Total = total;

        _context.SupplierInvoices.Add(invoice);
        await _context.SaveChangesAsync();

        var savedInvoice = await _context.SupplierInvoices
            .Include(i => i.Supplier)
            .Include(i => i.Items).ThenInclude(item => item.Product)
            .Include(i => i.Payments)
            .FirstAsync(i => i.Id == invoice.Id);

        return MapToDetailDto(savedInvoice);
    }

    public async Task<PaymentDto> AddPayment(int id, CreatePaymentRequest request)
    {
        var invoiceExists = await _context.SupplierInvoices.AnyAsync(i => i.Id == id);
        if (!invoiceExists)
            throw AppException.NotFound("Supplier Invoice", id);

        var payment = new SupplierInvoicePayment
        {
            SupplierInvoiceId = id,
            Amount = request.Amount,
            PaymentDate = DateTime.UtcNow,
            Notes = request.Notes
        };

        _context.SupplierInvoicePayments.Add(payment);
        await _context.SaveChangesAsync();

        return new PaymentDto(payment.Id, payment.Amount, payment.PaymentDate, payment.Notes);
    }

    public async Task<List<PaymentDto>> GetPayments(int id)
    {
        var invoiceExists = await _context.SupplierInvoices.AnyAsync(i => i.Id == id);
        if (!invoiceExists)
            throw AppException.NotFound("Supplier Invoice", id);

        return await _context.SupplierInvoicePayments
            .AsNoTracking()
            .Where(p => p.SupplierInvoiceId == id)
            .OrderByDescending(p => p.PaymentDate)
            .Select(p => new PaymentDto(p.Id, p.Amount, p.PaymentDate, p.Notes))
            .ToListAsync();
    }

    public async Task RemovePayment(int invoiceId, int paymentId)
    {
        var payment = await _context.SupplierInvoicePayments
            .FirstOrDefaultAsync(p => p.Id == paymentId && p.SupplierInvoiceId == invoiceId)
            ?? throw AppException.NotFound("Payment", paymentId);

        _context.SupplierInvoicePayments.Remove(payment);
        await _context.SaveChangesAsync();
    }

    private static SupplierInvoiceDetailDto MapToDetailDto(SupplierInvoice invoice)
    {
        var paidAmount = invoice.Payments.Sum(p => p.Amount);

        var items = invoice.Items.Select(i => new SupplierInvoiceItemDto(
            i.Id,
            i.ProductId,
            i.Product.Name,
            i.Quantity,
            i.CostPrice,
            i.SellingPrice,
            i.Total)).ToList();

        var payments = invoice.Payments.Select(p => new PaymentDto(
            p.Id,
            p.Amount,
            p.PaymentDate,
            p.Notes)).ToList();

        return new SupplierInvoiceDetailDto(
            invoice.Id,
            invoice.InvoiceNumber,
            invoice.SupplierId,
            invoice.Supplier.Name,
            invoice.InvoiceDate,
            invoice.Total,
            paidAmount,
            invoice.Total - paidAmount,
            invoice.Notes,
            items,
            payments);
    }
}
