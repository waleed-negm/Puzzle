using Puzzle.Domain.Common;

namespace Puzzle.Domain.Entities;

public class SupplierInvoice : BaseAuditableEntity
{
    public string InvoiceNumber { get; set; } = default!;
    public int SupplierId { get; set; }
    public DateTime InvoiceDate { get; set; }
    public decimal Total { get; set; }
    public string? Notes { get; set; }

    public Supplier Supplier { get; set; } = default!;
    public ICollection<SupplierInvoiceItem> Items { get; set; } = [];
    public ICollection<SupplierInvoicePayment> Payments { get; set; } = [];
}
