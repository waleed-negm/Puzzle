using Puzzle.Domain.Common;

namespace Puzzle.Domain.Entities;

public class Product : BaseAuditableEntity
{
    public string Name { get; set; } = default!;
    public string? Barcode { get; set; }
    public decimal Price { get; set; }
    public decimal CostPrice { get; set; }
    public int Stock { get; set; }
    public bool IsReturnable { get; set; }
    public decimal? ReturnPrice { get; set; }
    public int CategoryId { get; set; }

    public Category Category { get; set; } = default!;
    public ICollection<OrderItem> OrderItems { get; set; } = [];
    public ICollection<SupplierInvoiceItem> SupplierInvoiceItems { get; set; } = [];
}
