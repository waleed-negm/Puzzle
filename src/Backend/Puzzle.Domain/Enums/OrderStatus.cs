namespace Puzzle.Domain.Enums;

public enum OrderStatus
{
    Pending = 0,
    Confirmed = 1,
    Delivered = 2,
    Cancelled = 3,
    PartialReturn = 4,
    FullReturn = 5
}
