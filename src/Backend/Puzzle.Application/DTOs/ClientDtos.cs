namespace Puzzle.Application.DTOs;

public record ClientDto(int Id, string Name, string? Phone, string? Address);

public record ClientDetailDto(
    int Id,
    string Name,
    string? Phone,
    string? Address,
    decimal TotalOrders,
    decimal TotalPaid,
    decimal Balance);

public record CreateClientRequest(string Name, string? Phone, string? Address);

public record UpdateClientRequest(string Name, string? Phone, string? Address);
