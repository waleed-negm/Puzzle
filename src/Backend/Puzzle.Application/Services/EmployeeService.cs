using Microsoft.EntityFrameworkCore;
using Puzzle.Application.Common;
using Puzzle.Application.DTOs;
using Puzzle.Application.Interfaces;
using Puzzle.Domain.Entities;

namespace Puzzle.Application.Services;

public class EmployeeService
{
    private readonly IApplicationDbContext _context;

    public EmployeeService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<EmployeeDto>> GetAll()
    {
        return await _context.Employees
            .AsNoTracking()
            .OrderBy(e => e.Name)
            .Select(e => new EmployeeDto(e.Id, e.Name, e.Username, e.Role, e.IsActive))
            .ToListAsync();
    }

    public async Task<EmployeeDto> GetById(int id)
    {
        var employee = await _context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id)
            ?? throw AppException.NotFound("Employee", id);

        return new EmployeeDto(employee.Id, employee.Name, employee.Username, employee.Role, employee.IsActive);
    }

    public async Task<EmployeeDto> Create(CreateEmployeeRequest request)
    {
        var usernameExists = await _context.Employees.AnyAsync(e => e.Username == request.Username);
        if (usernameExists)
            throw AppException.BadRequest("An employee with this username already exists.");

        var employee = new Employee
        {
            Name = request.Name,
            Username = request.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return new EmployeeDto(employee.Id, employee.Name, employee.Username, employee.Role, employee.IsActive);
    }

    public async Task<EmployeeDto> Update(int id, UpdateEmployeeRequest request)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == id)
            ?? throw AppException.NotFound("Employee", id);

        var usernameExists = await _context.Employees
            .AnyAsync(e => e.Username == request.Username && e.Id != id);
        if (usernameExists)
            throw AppException.BadRequest("An employee with this username already exists.");

        employee.Name = request.Name;
        employee.Username = request.Username;
        employee.Role = request.Role;
        employee.IsActive = request.IsActive;
        employee.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.Password))
            employee.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        await _context.SaveChangesAsync();

        return new EmployeeDto(employee.Id, employee.Name, employee.Username, employee.Role, employee.IsActive);
    }

    public async Task Delete(int id)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == id)
            ?? throw AppException.NotFound("Employee", id);

        employee.IsActive = false;
        employee.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
