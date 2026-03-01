using Puzzle.Domain.Common;
using Puzzle.Domain.Enums;

namespace Puzzle.Domain.Entities;

public class Employee : BaseAuditableEntity
{
    public string Name { get; set; } = default!;
    public string Username { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; }
}
