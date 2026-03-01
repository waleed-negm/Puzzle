using Puzzle.Domain.Common;

namespace Puzzle.Domain.Entities;

public class SupplierInvoiceItem : BaseEntity
{
    public int SupplierInvoiceId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public decimal Total { get; set; }

    public SupplierInvoice SupplierInvoice { get; set; } = default!;
    public Product Product { get; set; } = default!;
}
