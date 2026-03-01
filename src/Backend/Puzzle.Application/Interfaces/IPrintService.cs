namespace Puzzle.Application.Interfaces;

public interface IPrintService
{
    Task<bool> PrintReceipt(int orderId);
    Task<string> GetReceiptPreview(int orderId);
}
