using Puzzle.Domain.Common;

namespace Puzzle.Domain.Entities;

public class OrderItem : BaseEntity
{
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Total { get; set; }
    public bool IsReturned { get; set; }
    public decimal? ReturnPrice { get; set; }

    public Order Order { get; set; } = default!;
    public Product Product { get; set; } = default!;
}
