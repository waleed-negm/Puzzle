using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Puzzle.Application.Common;
using Puzzle.Application.Interfaces;
using Puzzle.Domain.Entities;

namespace Puzzle.Application.Services;

public class PrintService : IPrintService
{
    private readonly IApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public PrintService(IApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<bool> PrintReceipt(int orderId)
    {
        var order = await LoadOrder(orderId);
        var receiptBytes = BuildReceiptBytes(order);
        await SendToUsb(receiptBytes);
        return true;
    }

    public async Task<string> GetReceiptPreview(int orderId)
    {
        var order = await LoadOrder(orderId);
        return BuildReceiptText(order);
    }

    private async Task<Order> LoadOrder(int orderId)
    {
        return await _context.Orders
            .Include(o => o.Client)
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Payments)
            .FirstOrDefaultAsync(o => o.Id == orderId)
            ?? throw AppException.NotFound("Order", orderId);
    }

    private byte[] BuildReceiptBytes(Order order)
    {
        Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
        var arabicEncoding = Encoding.GetEncoding(1256);

        var shopName = _configuration["PrinterSettings:ShopName"] ?? "Puzzle Stationery";
        var address = _configuration["PrinterSettings:Address"] ?? "";
        var phone = _configuration["PrinterSettings:Phone"] ?? "";
        var footer = _configuration["PrinterSettings:FooterMessage"] ?? "Thank you for your purchase!";
        var logoPath = _configuration["PrinterSettings:LogoPath"];

        using var ms = new MemoryStream();

        ms.Write(new byte[] { 0x1B, 0x40 });

        ms.Write(new byte[] { 0x1B, 0x74, 0x16 });

        if (!string.IsNullOrEmpty(logoPath) && File.Exists(logoPath))
        {
            try
            {
                var logoBytes = File.ReadAllBytes(logoPath);
                var width = 384;
                var bytesPerRow = width / 8;
                var height = logoBytes.Length / bytesPerRow;

                if (height > 0)
                {
                    ms.Write(new byte[] { 0x1B, 0x61, 0x01 });
                    var gsv0 = new byte[]
                    {
                        0x1D, 0x76, 0x30, 0x00,
                        (byte)(bytesPerRow & 0xFF), (byte)((bytesPerRow >> 8) & 0xFF),
                        (byte)(height & 0xFF), (byte)((height >> 8) & 0xFF)
                    };
                    ms.Write(gsv0);
                    ms.Write(logoBytes, 0, Math.Min(logoBytes.Length, bytesPerRow * height));
                }
            }
            catch
            {
            }
        }

        ms.Write(new byte[] { 0x1B, 0x61, 0x01 });

        ms.Write(new byte[] { 0x1B, 0x45, 0x01 });
        WriteArabicLine(ms, shopName, arabicEncoding);
        ms.Write(new byte[] { 0x1B, 0x45, 0x00 });

        if (!string.IsNullOrEmpty(address))
            WriteArabicLine(ms, address, arabicEncoding);

        if (!string.IsNullOrEmpty(phone))
            WriteArabicLine(ms, phone, arabicEncoding);

        WriteArabicLine(ms, "--------------------------------", arabicEncoding);

        ms.Write(new byte[] { 0x1B, 0x61, 0x00 });

        WriteArabicLine(ms, $"Order: {order.OrderNumber}", arabicEncoding);
        WriteArabicLine(ms, $"Date: {order.OrderDate:yyyy-MM-dd HH:mm}", arabicEncoding);

        if (order.Client != null)
            WriteArabicLine(ms, $"Client: {order.Client.Name}", arabicEncoding);

        WriteArabicLine(ms, "--------------------------------", arabicEncoding);

        WriteArabicLine(ms, string.Format("{0,-16} {1,4} {2,10}", "Item", "Qty", "Total"), arabicEncoding);
        WriteArabicLine(ms, "--------------------------------", arabicEncoding);

        foreach (var item in order.Items)
        {
            var name = item.Product.Name.Length > 16
                ? item.Product.Name[..16]
                : item.Product.Name;
            WriteArabicLine(ms, string.Format("{0,-16} {1,4} {2,10:F2}", name, item.Quantity, item.Total), arabicEncoding);

            if (item.IsReturned)
                WriteArabicLine(ms, $"  [RETURNED: -{item.ReturnPrice:F2}]", arabicEncoding);
        }

        WriteArabicLine(ms, "--------------------------------", arabicEncoding);

        WriteArabicLine(ms, string.Format("{0,-20} {1,10:F2}", "Subtotal:", order.SubTotal), arabicEncoding);

        if (order.Discount > 0)
            WriteArabicLine(ms, string.Format("{0,-20} {1,10:F2}", "Discount:", order.Discount), arabicEncoding);

        ms.Write(new byte[] { 0x1B, 0x45, 0x01 });
        WriteArabicLine(ms, string.Format("{0,-20} {1,10:F2}", "Total:", order.Total), arabicEncoding);
        ms.Write(new byte[] { 0x1B, 0x45, 0x00 });

        var paidAmount = order.Payments.Sum(p => p.Amount);
        WriteArabicLine(ms, string.Format("{0,-20} {1,10:F2}", "Paid:", paidAmount), arabicEncoding);
        WriteArabicLine(ms, string.Format("{0,-20} {1,10:F2}", "Remaining:", order.Total - paidAmount), arabicEncoding);

        WriteArabicLine(ms, "--------------------------------", arabicEncoding);

        ms.Write(new byte[] { 0x1B, 0x61, 0x01 });
        WriteArabicLine(ms, footer, arabicEncoding);

        ms.Write(new byte[] { 0x0A, 0x0A, 0x0A });

        ms.Write(new byte[] { 0x1D, 0x56, 0x42, 0x03 });

        ms.Write(new byte[] { 0x1B, 0x70, 0x00, 0x19, 0xFA });

        return ms.ToArray();
    }

    private string BuildReceiptText(Order order)
    {
        var shopName = _configuration["PrinterSettings:ShopName"] ?? "Puzzle Stationery";
        var address = _configuration["PrinterSettings:Address"] ?? "";
        var phone = _configuration["PrinterSettings:Phone"] ?? "";
        var footer = _configuration["PrinterSettings:FooterMessage"] ?? "Thank you for your purchase!";

        var sb = new StringBuilder();

        sb.AppendLine(CenterText(shopName, 32));
        if (!string.IsNullOrEmpty(address))
            sb.AppendLine(CenterText(address, 32));
        if (!string.IsNullOrEmpty(phone))
            sb.AppendLine(CenterText(phone, 32));

        sb.AppendLine("--------------------------------");

        sb.AppendLine($"Order: {order.OrderNumber}");
        sb.AppendLine($"Date: {order.OrderDate:yyyy-MM-dd HH:mm}");

        if (order.Client != null)
            sb.AppendLine($"Client: {order.Client.Name}");

        sb.AppendLine("--------------------------------");

        sb.AppendLine(string.Format("{0,-16} {1,4} {2,10}", "Item", "Qty", "Total"));
        sb.AppendLine("--------------------------------");

        foreach (var item in order.Items)
        {
            var name = item.Product.Name.Length > 16
                ? item.Product.Name[..16]
                : item.Product.Name;
            sb.AppendLine(string.Format("{0,-16} {1,4} {2,10:F2}", name, item.Quantity, item.Total));

            if (item.IsReturned)
                sb.AppendLine($"  [RETURNED: -{item.ReturnPrice:F2}]");
        }

        sb.AppendLine("--------------------------------");

        sb.AppendLine(string.Format("{0,-20} {1,10:F2}", "Subtotal:", order.SubTotal));

        if (order.Discount > 0)
            sb.AppendLine(string.Format("{0,-20} {1,10:F2}", "Discount:", order.Discount));

        sb.AppendLine(string.Format("{0,-20} {1,10:F2}", "Total:", order.Total));

        var paidAmount = order.Payments.Sum(p => p.Amount);
        sb.AppendLine(string.Format("{0,-20} {1,10:F2}", "Paid:", paidAmount));
        sb.AppendLine(string.Format("{0,-20} {1,10:F2}", "Remaining:", order.Total - paidAmount));

        sb.AppendLine("--------------------------------");

        sb.AppendLine(CenterText(footer, 32));

        return sb.ToString();
    }

    private static void WriteArabicLine(MemoryStream ms, string text, Encoding encoding)
    {
        var bytes = encoding.GetBytes(text);
        ms.Write(bytes);
        ms.Write(new byte[] { 0x0A });
    }

    private static string CenterText(string text, int width)
    {
        if (text.Length >= width)
            return text;

        var padding = (width - text.Length) / 2;
        return text.PadLeft(text.Length + padding).PadRight(width);
    }

    private async Task SendToUsb(byte[] data)
    {
        var usbPath = _configuration["PrinterSettings:UsbPath"]
            ?? throw AppException.BadRequest("Printer USB path is not configured.");

        await File.WriteAllBytesAsync(usbPath, data);
    }
}
