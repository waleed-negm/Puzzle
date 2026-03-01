using Puzzle.Domain.Common;

namespace Puzzle.Domain.Entities;

public class Supplier : BaseAuditableEntity
{
    public string Name { get; set; } = default!;
    public string? Phone { get; set; }
    public string? Address { get; set; }

    public ICollection<SupplierInvoice> Invoices { get; set; } = new List<SupplierInvoice>();
    public ICollection<SupplierPayment> Payments { get; set; } = new List<SupplierPayment>();
}
