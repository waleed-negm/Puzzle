using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Puzzle.Application.Common;
using Puzzle.Application.DTOs;
using Puzzle.Application.Interfaces;
using Puzzle.Domain.Entities;

namespace Puzzle.Application.Services;

public class AuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(IApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponse> Login(LoginRequest request)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Username == request.Username && e.IsActive);

        if (employee is null)
            throw AppException.Unauthorized("Invalid username or password.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, employee.PasswordHash))
            throw AppException.Unauthorized("Invalid username or password.");

        var token = GenerateToken(employee);

        var employeeDto = new EmployeeDto(
            employee.Id,
            employee.Name,
            employee.Username,
            employee.Role,
            employee.IsActive);

        return new LoginResponse(token, employeeDto);
    }

    public async Task ChangePassword(int employeeId, ChangePasswordRequest request)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == employeeId)
            ?? throw AppException.NotFound("Employee", employeeId);

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, employee.PasswordHash))
            throw AppException.BadRequest("Current password is incorrect.");

        employee.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        employee.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    private string GenerateToken(Employee employee)
    {
        var secret = _configuration["JwtSettings:Secret"]!;
        var issuer = _configuration["JwtSettings:Issuer"]!;
        var audience = _configuration["JwtSettings:Audience"]!;
        var expirationHours = int.Parse(_configuration["JwtSettings:ExpirationInHours"]!);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, employee.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Name, employee.Name),
            new Claim(ClaimTypes.Role, employee.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, employee.Username)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expirationHours),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
