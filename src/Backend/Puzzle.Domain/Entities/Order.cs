using Puzzle.Domain.Common;
using Puzzle.Domain.Enums;

namespace Puzzle.Domain.Entities;

public class Order : BaseAuditableEntity
{
    public string OrderNumber { get; set; } = default!;
    public int? ClientId { get; set; }
    public DateTime OrderDate { get; set; }
    public OrderStatus Status { get; set; }
    public decimal Discount { get; set; }
    public decimal SubTotal { get; set; }
    public decimal Total { get; set; }
    public string? Notes { get; set; }

    public Client? Client { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<OrderPayment> Payments { get; set; } = new List<OrderPayment>();
}
