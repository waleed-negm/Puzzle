using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Puzzle.Application.DTOs;
using Puzzle.Application.Services;

namespace Puzzle.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class SupplierInvoicesController : ControllerBase
{
    private readonly SupplierInvoiceService _supplierInvoiceService;

    public SupplierInvoicesController(SupplierInvoiceService supplierInvoiceService)
    {
        _supplierInvoiceService = supplierInvoiceService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? supplierId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _supplierInvoiceService.GetAll(supplierId, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _supplierInvoiceService.GetById(id);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateSupplierInvoiceRequest request)
    {
        var result = await _supplierInvoiceService.Create(request);
        return Created($"api/supplierinvoices/{result.Id}", result);
    }

    [HttpGet("{id}/payments")]
    public async Task<IActionResult> GetPayments(int id)
    {
        var result = await _supplierInvoiceService.GetPayments(id);
        return Ok(result);
    }

    [HttpPost("{id}/payments")]
    public async Task<IActionResult> AddPayment(int id, CreatePaymentRequest request)
    {
        var result = await _supplierInvoiceService.AddPayment(id, request);
        return Created($"api/supplierinvoices/{id}/payments/{result.Id}", result);
    }

    [HttpDelete("{id}/payments/{paymentId}")]
    public async Task<IActionResult> RemovePayment(int id, int paymentId)
    {
        await _supplierInvoiceService.RemovePayment(id, paymentId);
        return NoContent();
    }
}
