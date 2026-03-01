using Puzzle.Domain.Common;

namespace Puzzle.Domain.Entities;

public class ClientPayment : BaseEntity
{
    public int ClientId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? Notes { get; set; }

    public Client Client { get; set; } = default!;
}
