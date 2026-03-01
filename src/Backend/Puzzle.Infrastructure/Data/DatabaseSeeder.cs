using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Puzzle.Domain.Entities;
using Puzzle.Domain.Enums;

namespace Puzzle.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        await context.Database.MigrateAsync();

        if (!await context.Employees.AnyAsync())
        {
            context.Employees.Add(new Employee
            {
                Name = "المدير",
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = UserRole.Admin,
                IsActive = true
            });
            await context.SaveChangesAsync();
        }

        if (!await context.Categories.AnyAsync())
        {
            context.Categories.AddRange(
                new Category { Name = "أدوات مكتبية", Description = "أقلام ودفاتر وملفات" },
                new Category { Name = "أدوات مدرسية", Description = "حقائب وأدوات مدرسية" },
                new Category { Name = "هدايا", Description = "هدايا متنوعة" },
                new Category { Name = "ألعاب", Description = "ألعاب أطفال" },
                new Category { Name = "إكسسوارات", Description = "إكسسوارات متنوعة" }
            );
            await context.SaveChangesAsync();
        }
    }
}
