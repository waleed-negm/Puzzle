namespace Puzzle.Application.DTOs;

public record LoginRequest(string Username, string Password);

public record LoginResponse(string Token, EmployeeDto Employee);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
