using Puzzle.Domain.Common;

namespace Puzzle.Domain.Entities;

public class SupplierPayment : BaseEntity
{
    public int SupplierId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? Notes { get; set; }

    public Supplier Supplier { get; set; } = default!;
}
