namespace Puzzle.Application.DTOs;

public record ProductDto(
    int Id,
    string Name,
    string? Barcode,
    decimal Price,
    decimal CostPrice,
    int Stock,
    bool IsReturnable,
    decimal? ReturnPrice,
    int CategoryId,
    string CategoryName);

public record CreateProductRequest(
    string Name,
    string? Barcode,
    decimal Price,
    decimal CostPrice,
    int Stock,
    bool IsReturnable,
    decimal? ReturnPrice,
    int CategoryId);

public record UpdateProductRequest(
    string Name,
    string? Barcode,
    decimal Price,
    decimal CostPrice,
    int Stock,
    bool IsReturnable,
    decimal? ReturnPrice,
    int CategoryId);
