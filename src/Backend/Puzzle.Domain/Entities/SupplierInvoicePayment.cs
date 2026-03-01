using Puzzle.Domain.Common;

namespace Puzzle.Domain.Entities;

public class SupplierInvoicePayment : BaseEntity
{
    public int SupplierInvoiceId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? Notes { get; set; }

    public SupplierInvoice SupplierInvoice { get; set; } = default!;
}
