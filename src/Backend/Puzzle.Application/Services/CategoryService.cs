using Microsoft.EntityFrameworkCore;
using Puzzle.Application.Common;
using Puzzle.Application.DTOs;
using Puzzle.Application.Interfaces;
using Puzzle.Domain.Entities;

namespace Puzzle.Application.Services;

public class CategoryService
{
    private readonly IApplicationDbContext _context;

    public CategoryService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> GetAll()
    {
        return await _context.Categories
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Description))
            .ToListAsync();
    }

    public async Task<CategoryDto> GetById(int id)
    {
        var category = await _context.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw AppException.NotFound("Category", id);

        return new CategoryDto(category.Id, category.Name, category.Description);
    }

    public async Task<CategoryDto> Create(CreateCategoryRequest request)
    {
        var category = new Category
        {
            Name = request.Name,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return new CategoryDto(category.Id, category.Name, category.Description);
    }

    public async Task<CategoryDto> Update(int id, UpdateCategoryRequest request)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw AppException.NotFound("Category", id);

        category.Name = request.Name;
        category.Description = request.Description;
        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new CategoryDto(category.Id, category.Name, category.Description);
    }

    public async Task Delete(int id)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw AppException.NotFound("Category", id);

        var hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == id);
        if (hasProducts)
            throw AppException.BadRequest("Cannot delete category that has associated products.");

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
    }
}
