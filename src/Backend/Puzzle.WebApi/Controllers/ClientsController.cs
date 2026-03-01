using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Puzzle.Application.DTOs;
using Puzzle.Application.Services;

namespace Puzzle.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly ClientService _clientService;

    public ClientsController(ClientService clientService)
    {
        _clientService = clientService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search)
    {
        var result = await _clientService.GetAll(search);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _clientService.GetById(id);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateClientRequest request)
    {
        var result = await _clientService.Create(request);
        return Created($"api/clients/{result.Id}", result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateClientRequest request)
    {
        var result = await _clientService.Update(id, request);
        return Ok(result);
    }

    [HttpGet("{id}/orders")]
    public async Task<IActionResult> GetOrders(int id)
    {
        var result = await _clientService.GetOrders(id);
        return Ok(result);
    }

    [HttpGet("{id}/payments")]
    public async Task<IActionResult> GetPayments(int id)
    {
        var result = await _clientService.GetPayments(id);
        return Ok(result);
    }

    [HttpGet("{id}/balance")]
    public async Task<IActionResult> GetBalance(int id)
    {
        var result = await _clientService.GetBalance(id);
        return Ok(result);
    }
}
