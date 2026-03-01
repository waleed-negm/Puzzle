namespace Puzzle.Application.Common;

public class AppException : Exception
{
    public int StatusCode { get; }

    public AppException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }

    public static AppException NotFound(string entity, object id)
        => new($"{entity} with ID {id} was not found.", 404);

    public static AppException BadRequest(string message)
        => new(message, 400);

    public static AppException Unauthorized(string message = "Unauthorized")
        => new(message, 401);
}
