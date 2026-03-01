using Microsoft.EntityFrameworkCore;
using Puzzle.Domain.Entities;

namespace Puzzle.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Category> Categories { get; }
    DbSet<Product> Products { get; }
    DbSet<Employee> Employees { get; }
    DbSet<Client> Clients { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<OrderPayment> OrderPayments { get; }
    DbSet<ClientPayment> ClientPayments { get; }
    DbSet<Supplier> Suppliers { get; }
    DbSet<SupplierInvoice> SupplierInvoices { get; }
    DbSet<SupplierInvoiceItem> SupplierInvoiceItems { get; }
    DbSet<SupplierInvoicePayment> SupplierInvoicePayments { get; }
    DbSet<SupplierPayment> SupplierPayments { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
