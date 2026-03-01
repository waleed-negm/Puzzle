namespace Puzzle.Application.DTOs;

public record CategoryDto(int Id, string Name, string? Description);

public record CreateCategoryRequest(string Name, string? Description);

public record UpdateCategoryRequest(string Name, string? Description);
