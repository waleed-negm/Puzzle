using Microsoft.EntityFrameworkCore;
using Puzzle.Application.Common;
using Puzzle.Application.DTOs;
using Puzzle.Application.Interfaces;
using Puzzle.Domain.Entities;

namespace Puzzle.Application.Services;

public class ProductService
{
    private readonly IApplicationDbContext _context;

    public ProductService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<ProductDto>> GetAll(string? search, int? categoryId, int page = 1, int pageSize = 20)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(term) ||
                (p.Barcode != null && p.Barcode.ToLower().Contains(term)));
        }

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductDto(
                p.Id,
                p.Name,
                p.Barcode,
                p.Price,
                p.CostPrice,
                p.Stock,
                p.IsReturnable,
                p.ReturnPrice,
                p.CategoryId,
                p.Category.Name))
            .ToListAsync();

        return new PaginatedResult<ProductDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ProductDto> GetById(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw AppException.NotFound("Product", id);

        return new ProductDto(
            product.Id,
            product.Name,
            product.Barcode,
            product.Price,
            product.CostPrice,
            product.Stock,
            product.IsReturnable,
            product.ReturnPrice,
            product.CategoryId,
            product.Category.Name);
    }

    public async Task<ProductDto> GetByBarcode(string barcode)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Barcode == barcode)
            ?? throw AppException.BadRequest($"Product with barcode '{barcode}' was not found.");

        return new ProductDto(
            product.Id,
            product.Name,
            product.Barcode,
            product.Price,
            product.CostPrice,
            product.Stock,
            product.IsReturnable,
            product.ReturnPrice,
            product.CategoryId,
            product.Category.Name);
    }

    public async Task<ProductDto> Create(CreateProductRequest request)
    {
        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == request.CategoryId);
        if (!categoryExists)
            throw AppException.BadRequest("The specified category does not exist.");

        var product = new Product
        {
            Name = request.Name,
            Barcode = request.Barcode,
            Price = request.Price,
            CostPrice = request.CostPrice,
            Stock = request.Stock,
            IsReturnable = request.IsReturnable,
            ReturnPrice = request.ReturnPrice,
            CategoryId = request.CategoryId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        var category = await _context.Categories.FindAsync(request.CategoryId);

        return new ProductDto(
            product.Id,
            product.Name,
            product.Barcode,
            product.Price,
            product.CostPrice,
            product.Stock,
            product.IsReturnable,
            product.ReturnPrice,
            product.CategoryId,
            category!.Name);
    }

    public async Task<ProductDto> Update(int id, UpdateProductRequest request)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw AppException.NotFound("Product", id);

        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == request.CategoryId);
        if (!categoryExists)
            throw AppException.BadRequest("The specified category does not exist.");

        product.Name = request.Name;
        product.Barcode = request.Barcode;
        product.Price = request.Price;
        product.CostPrice = request.CostPrice;
        product.Stock = request.Stock;
        product.IsReturnable = request.IsReturnable;
        product.ReturnPrice = request.ReturnPrice;
        product.CategoryId = request.CategoryId;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var category = await _context.Categories.FindAsync(request.CategoryId);

        return new ProductDto(
            product.Id,
            product.Name,
            product.Barcode,
            product.Price,
            product.CostPrice,
            product.Stock,
            product.IsReturnable,
            product.ReturnPrice,
            product.CategoryId,
            category!.Name);
    }

    public async Task Delete(int id)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw AppException.NotFound("Product", id);

        var hasOrderItems = await _context.OrderItems.AnyAsync(oi => oi.ProductId == id);
        if (hasOrderItems)
            throw AppException.BadRequest("Cannot delete product that has associated order items.");

        var hasInvoiceItems = await _context.SupplierInvoiceItems.AnyAsync(si => si.ProductId == id);
        if (hasInvoiceItems)
            throw AppException.BadRequest("Cannot delete product that has associated supplier invoice items.");

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
    }
}
