using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Puzzle.Application.DTOs;
using Puzzle.Application.Interfaces;
using Puzzle.Application.Services;

namespace Puzzle.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly OrderService _orderService;
    private readonly IPrintService _printService;

    public OrdersController(OrderService orderService, IPrintService printService)
    {
        _orderService = orderService;
        _printService = printService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _orderService.GetAll(search, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _orderService.GetById(id);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderRequest request)
    {
        var result = await _orderService.Create(request);
        return Created($"api/orders/{result.Id}", result);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusRequest request)
    {
        await _orderService.UpdateStatus(id, request);
        return NoContent();
    }

    [HttpPost("{id}/return")]
    public async Task<IActionResult> ReturnItems(int id, ReturnItemsRequest request)
    {
        var result = await _orderService.ReturnItems(id, request);
        return Ok(result);
    }

    [HttpGet("{id}/payments")]
    public async Task<IActionResult> GetPayments(int id)
    {
        var result = await _orderService.GetPayments(id);
        return Ok(result);
    }

    [HttpPost("{id}/payments")]
    public async Task<IActionResult> AddPayment(int id, CreatePaymentRequest request)
    {
        var result = await _orderService.AddPayment(id, request);
        return Created($"api/orders/{id}/payments/{result.Id}", result);
    }

    [HttpDelete("{id}/payments/{paymentId}")]
    public async Task<IActionResult> RemovePayment(int id, int paymentId)
    {
        await _orderService.RemovePayment(id, paymentId);
        return NoContent();
    }

    [HttpPost("{id}/print")]
    public async Task<IActionResult> Print(int id)
    {
        await _printService.PrintReceipt(id);
        return Ok();
    }

    [HttpGet("{id}/receipt")]
    public async Task<IActionResult> GetReceipt(int id)
    {
        var result = await _printService.GetReceiptPreview(id);
        return Ok(result);
    }
}
