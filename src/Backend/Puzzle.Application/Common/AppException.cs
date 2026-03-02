namespace Puzzle.Application.Common;

public class AppException(string message, int statusCode = 400) : Exception(message)
{
    public int StatusCode { get; } = statusCode;

    public static AppException NotFound(string entity, object id)
        => new($"{entity} with ID {id} was not found.", 404);

    public static AppException BadRequest(string message)
        => new(message, 400);

    public static AppException Unauthorized(string message = "Unauthorized")
        => new(message, 401);
}
