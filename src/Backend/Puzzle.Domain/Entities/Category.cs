using Puzzle.Domain.Common;

namespace Puzzle.Domain.Entities;

public class Category : BaseAuditableEntity
{
    public string Name { get; set; } = default!;
    public string? Description { get; set; }

    public ICollection<Product> Products { get; set; } = [];
}
