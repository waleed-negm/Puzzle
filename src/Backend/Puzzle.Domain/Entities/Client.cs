using Puzzle.Domain.Common;

namespace Puzzle.Domain.Entities;

public class Client : BaseAuditableEntity
{
    public string Name { get; set; } = default!;
    public string? Phone { get; set; }
    public string? Address { get; set; }

    public ICollection<Order> Orders { get; set; } = [];
    public ICollection<ClientPayment> Payments { get; set; } = [];
}
