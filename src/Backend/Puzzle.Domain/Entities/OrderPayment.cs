using Puzzle.Domain.Common;

namespace Puzzle.Domain.Entities;

public class OrderPayment : BaseEntity
{
    public int OrderId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? Notes { get; set; }

    public Order Order { get; set; } = default!;
}
