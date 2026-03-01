using Microsoft.EntityFrameworkCore;
using Puzzle.Application.Common;
using Puzzle.Application.DTOs;
using Puzzle.Application.Interfaces;
using Puzzle.Domain.Entities;
using Puzzle.Domain.Enums;

namespace Puzzle.Application.Services;

public class ClientService
{
    private readonly IApplicationDbContext _context;

    public ClientService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ClientDto>> GetAll(string? search)
    {
        var query = _context.Clients.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(c =>
                c.Name.ToLower().Contains(term) ||
                (c.Phone != null && c.Phone.Contains(term)));
        }

        return await query
            .OrderBy(c => c.Name)
            .Select(c => new ClientDto(c.Id, c.Name, c.Phone, c.Address))
            .ToListAsync();
    }

    public async Task<ClientDetailDto> GetById(int id)
    {
        var client = await _context.Clients
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw AppException.NotFound("Client", id);

        return await BuildClientDetailDto(client);
    }

    public async Task<ClientDto> Create(CreateClientRequest request)
    {
        var client = new Client
        {
            Name = request.Name,
            Phone = request.Phone,
            Address = request.Address,
            CreatedAt = DateTime.UtcNow
        };

        _context.Clients.Add(client);
        await _context.SaveChangesAsync();

        return new ClientDto(client.Id, client.Name, client.Phone, client.Address);
    }

    public async Task<ClientDto> Update(int id, UpdateClientRequest request)
    {
        var client = await _context.Clients
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw AppException.NotFound("Client", id);

        client.Name = request.Name;
        client.Phone = request.Phone;
        client.Address = request.Address;
        client.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ClientDto(client.Id, client.Name, client.Phone, client.Address);
    }

    public async Task<List<OrderDto>> GetOrders(int clientId)
    {
        var clientExists = await _context.Clients.AnyAsync(c => c.Id == clientId);
        if (!clientExists)
            throw AppException.NotFound("Client", clientId);

        return await _context.Orders
            .Include(o => o.Client)
            .Include(o => o.Payments)
            .AsNoTracking()
            .Where(o => o.ClientId == clientId)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new OrderDto(
                o.Id,
                o.OrderNumber,
                o.ClientId,
                o.Client != null ? o.Client.Name : null,
                o.OrderDate,
                o.Status,
                o.Discount,
                o.SubTotal,
                o.Total,
                o.Payments.Sum(p => p.Amount),
                o.Total - o.Payments.Sum(p => p.Amount),
                o.Notes))
            .ToListAsync();
    }

    public async Task<List<PaymentDto>> GetPayments(int clientId)
    {
        var clientExists = await _context.Clients.AnyAsync(c => c.Id == clientId);
        if (!clientExists)
            throw AppException.NotFound("Client", clientId);

        return await _context.ClientPayments
            .AsNoTracking()
            .Where(p => p.ClientId == clientId)
            .OrderByDescending(p => p.PaymentDate)
            .Select(p => new PaymentDto(p.Id, p.Amount, p.PaymentDate, p.Notes))
            .ToListAsync();
    }

    public async Task<ClientDetailDto> GetBalance(int clientId)
    {
        var client = await _context.Clients
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == clientId)
            ?? throw AppException.NotFound("Client", clientId);

        return await BuildClientDetailDto(client);
    }

    private async Task<ClientDetailDto> BuildClientDetailDto(Client client)
    {
        var totalOrders = await _context.Orders
            .Where(o => o.ClientId == client.Id && o.Status != OrderStatus.Cancelled)
            .SumAsync(o => (decimal?)o.Total) ?? 0;

        var totalOrderPayments = await _context.OrderPayments
            .Where(op => op.Order.ClientId == client.Id)
            .SumAsync(op => (decimal?)op.Amount) ?? 0;

        var totalClientPayments = await _context.ClientPayments
            .Where(cp => cp.ClientId == client.Id)
            .SumAsync(cp => (decimal?)cp.Amount) ?? 0;

        var totalPaid = totalOrderPayments + totalClientPayments;
        var balance = totalOrders - totalPaid;

        return new ClientDetailDto(
            client.Id,
            client.Name,
            client.Phone,
            client.Address,
            totalOrders,
            totalPaid,
            balance);
    }
}
