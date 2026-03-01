using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Puzzle.Application.DTOs;
using Puzzle.Application.Services;

namespace Puzzle.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly PaymentService _paymentService;

    public PaymentsController(PaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpPost("client")]
    public async Task<IActionResult> AddClientPayment(CreateClientPaymentRequest request)
    {
        var result = await _paymentService.AddClientPayment(request);
        return Created($"api/payments/{result.Id}", result);
    }

    [HttpPost("supplier")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddSupplierPayment(CreateSupplierPaymentRequest request)
    {
        var result = await _paymentService.AddSupplierPayment(request);
        return Created($"api/payments/{result.Id}", result);
    }
}
