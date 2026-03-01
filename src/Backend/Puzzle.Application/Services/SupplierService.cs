using Microsoft.EntityFrameworkCore;
using Puzzle.Application.Common;
using Puzzle.Application.DTOs;
using Puzzle.Application.Interfaces;
using Puzzle.Domain.Entities;

namespace Puzzle.Application.Services;

public class SupplierService
{
    private readonly IApplicationDbContext _context;

    public SupplierService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<SupplierDto>> GetAll(string? search)
    {
        var query = _context.Suppliers.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(s =>
                s.Name.ToLower().Contains(term) ||
                (s.Phone != null && s.Phone.Contains(term)));
        }

        return await query
            .OrderBy(s => s.Name)
            .Select(s => new SupplierDto(s.Id, s.Name, s.Phone, s.Address))
            .ToListAsync();
    }

    public async Task<SupplierDetailDto> GetById(int id)
    {
        var supplier = await _context.Suppliers
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id)
            ?? throw AppException.NotFound("Supplier", id);

        return await BuildSupplierDetailDto(supplier);
    }

    public async Task<SupplierDto> Create(CreateSupplierRequest request)
    {
        var supplier = new Supplier
        {
            Name = request.Name,
            Phone = request.Phone,
            Address = request.Address,
            CreatedAt = DateTime.UtcNow
        };

        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync();

        return new SupplierDto(supplier.Id, supplier.Name, supplier.Phone, supplier.Address);
    }

    public async Task<SupplierDto> Update(int id, UpdateSupplierRequest request)
    {
        var supplier = await _context.Suppliers
            .FirstOrDefaultAsync(s => s.Id == id)
            ?? throw AppException.NotFound("Supplier", id);

        supplier.Name = request.Name;
        supplier.Phone = request.Phone;
        supplier.Address = request.Address;
        supplier.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new SupplierDto(supplier.Id, supplier.Name, supplier.Phone, supplier.Address);
    }

    public async Task<SupplierDetailDto> GetBalance(int supplierId)
    {
        var supplier = await _context.Suppliers
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == supplierId)
            ?? throw AppException.NotFound("Supplier", supplierId);

        return await BuildSupplierDetailDto(supplier);
    }

    private async Task<SupplierDetailDto> BuildSupplierDetailDto(Supplier supplier)
    {
        var totalInvoices = await _context.SupplierInvoices
            .Where(i => i.SupplierId == supplier.Id)
            .SumAsync(i => (decimal?)i.Total) ?? 0;

        var totalInvoicePayments = await _context.SupplierInvoicePayments
            .Where(p => p.SupplierInvoice.SupplierId == supplier.Id)
            .SumAsync(p => (decimal?)p.Amount) ?? 0;

        var totalSupplierPayments = await _context.SupplierPayments
            .Where(p => p.SupplierId == supplier.Id)
            .SumAsync(p => (decimal?)p.Amount) ?? 0;

        var totalPaid = totalInvoicePayments + totalSupplierPayments;
        var balance = totalInvoices - totalPaid;

        return new SupplierDetailDto(
            supplier.Id,
            supplier.Name,
            supplier.Phone,
            supplier.Address,
            totalInvoices,
            totalPaid,
            balance);
    }
}
