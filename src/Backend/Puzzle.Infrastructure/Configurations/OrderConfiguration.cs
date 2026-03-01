using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Puzzle.Domain.Entities;

namespace Puzzle.Infrastructure.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.Property(o => o.OrderNumber).IsRequired().HasMaxLength(50);
        builder.Property(o => o.Discount).HasColumnType("decimal(18,2)");
        builder.Property(o => o.SubTotal).HasColumnType("decimal(18,2)");
        builder.Property(o => o.Total).HasColumnType("decimal(18,2)");
        builder.Property(o => o.Notes).HasMaxLength(1000);
        builder.HasIndex(o => o.OrderNumber).IsUnique();
        builder.HasOne(o => o.Client).WithMany(c => c.Orders).HasForeignKey(o => o.ClientId).OnDelete(DeleteBehavior.SetNull);
    }
}

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.Property(i => i.UnitPrice).HasColumnType("decimal(18,2)");
        builder.Property(i => i.Total).HasColumnType("decimal(18,2)");
        builder.Property(i => i.ReturnPrice).HasColumnType("decimal(18,2)");
        builder.HasOne(i => i.Order).WithMany(o => o.Items).HasForeignKey(i => i.OrderId);
        builder.HasOne(i => i.Product).WithMany(p => p.OrderItems).HasForeignKey(i => i.ProductId);
    }
}

public class OrderPaymentConfiguration : IEntityTypeConfiguration<OrderPayment>
{
    public void Configure(EntityTypeBuilder<OrderPayment> builder)
    {
        builder.Property(p => p.Amount).HasColumnType("decimal(18,2)");
        builder.Property(p => p.Notes).HasMaxLength(500);
        builder.HasOne(p => p.Order).WithMany(o => o.Payments).HasForeignKey(p => p.OrderId);
    }
}
