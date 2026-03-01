FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/Backend/Puzzle.Domain/Puzzle.Domain.csproj Puzzle.Domain/
COPY src/Backend/Puzzle.Application/Puzzle.Application.csproj Puzzle.Application/
COPY src/Backend/Puzzle.Infrastructure/Puzzle.Infrastructure.csproj Puzzle.Infrastructure/
COPY src/Backend/Puzzle.WebApi/Puzzle.WebApi.csproj Puzzle.WebApi/
RUN dotnet restore Puzzle.WebApi/Puzzle.WebApi.csproj

COPY src/Backend/ .
RUN dotnet publish Puzzle.WebApi/Puzzle.WebApi.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5000
ENTRYPOINT ["dotnet", "Puzzle.WebApi.dll"]
