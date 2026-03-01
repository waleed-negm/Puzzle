using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Puzzle.Domain.Entities;

namespace Puzzle.Infrastructure.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.Property(e => e.Name).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Username).IsRequired().HasMaxLength(100);
        builder.Property(e => e.PasswordHash).IsRequired();
        builder.HasIndex(e => e.Username).IsUnique();
    }
}
