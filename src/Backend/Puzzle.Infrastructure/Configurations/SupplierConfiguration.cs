using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Puzzle.Domain.Entities;

namespace Puzzle.Infrastructure.Configurations;

public class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
{
    public void Configure(EntityTypeBuilder<Supplier> builder)
    {
        builder.Property(s => s.Name).IsRequired().HasMaxLength(200);
        builder.Property(s => s.Phone).HasMaxLength(50);
        builder.Property(s => s.Address).HasMaxLength(500);
    }
}

public class SupplierInvoiceConfiguration : IEntityTypeConfiguration<SupplierInvoice>
{
    public void Configure(EntityTypeBuilder<SupplierInvoice> builder)
    {
        builder.Property(i => i.InvoiceNumber).IsRequired().HasMaxLength(50);
        builder.Property(i => i.Total).HasColumnType("decimal(18,2)");
        builder.Property(i => i.Notes).HasMaxLength(1000);
        builder.HasIndex(i => i.InvoiceNumber).IsUnique();
        builder.HasOne(i => i.Supplier).WithMany(s => s.Invoices).HasForeignKey(i => i.SupplierId);
    }
}

public class SupplierInvoiceItemConfiguration : IEntityTypeConfiguration<SupplierInvoiceItem>
{
    public void Configure(EntityTypeBuilder<SupplierInvoiceItem> builder)
    {
        builder.Property(i => i.CostPrice).HasColumnType("decimal(18,2)");
        builder.Property(i => i.SellingPrice).HasColumnType("decimal(18,2)");
        builder.Property(i => i.Total).HasColumnType("decimal(18,2)");
        builder.HasOne(i => i.SupplierInvoice).WithMany(si => si.Items).HasForeignKey(i => i.SupplierInvoiceId);
        builder.HasOne(i => i.Product).WithMany(p => p.SupplierInvoiceItems).HasForeignKey(i => i.ProductId);
    }
}

public class SupplierInvoicePaymentConfiguration : IEntityTypeConfiguration<SupplierInvoicePayment>
{
    public void Configure(EntityTypeBuilder<SupplierInvoicePayment> builder)
    {
        builder.Property(p => p.Amount).HasColumnType("decimal(18,2)");
        builder.Property(p => p.Notes).HasMaxLength(500);
        builder.HasOne(p => p.SupplierInvoice).WithMany(i => i.Payments).HasForeignKey(p => p.SupplierInvoiceId);
    }
}

public class ClientPaymentConfiguration : IEntityTypeConfiguration<ClientPayment>
{
    public void Configure(EntityTypeBuilder<ClientPayment> builder)
    {
        builder.Property(p => p.Amount).HasColumnType("decimal(18,2)");
        builder.Property(p => p.Notes).HasMaxLength(500);
        builder.HasOne(p => p.Client).WithMany(c => c.Payments).HasForeignKey(p => p.ClientId);
    }
}

public class SupplierPaymentConfiguration : IEntityTypeConfiguration<SupplierPayment>
{
    public void Configure(EntityTypeBuilder<SupplierPayment> builder)
    {
        builder.Property(p => p.Amount).HasColumnType("decimal(18,2)");
        builder.Property(p => p.Notes).HasMaxLength(500);
        builder.HasOne(p => p.Supplier).WithMany(s => s.Payments).HasForeignKey(p => p.SupplierId);
    }
}
