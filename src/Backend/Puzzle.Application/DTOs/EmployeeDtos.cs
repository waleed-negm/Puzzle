using Puzzle.Domain.Enums;

namespace Puzzle.Application.DTOs;

public record EmployeeDto(int Id, string Name, string Username, UserRole Role, bool IsActive);

public record CreateEmployeeRequest(string Name, string Username, string Password, UserRole Role);

public record UpdateEmployeeRequest(string Name, string Username, UserRole Role, bool IsActive, string? Password);
