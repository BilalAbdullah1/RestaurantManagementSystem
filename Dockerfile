# Multi-stage Dockerfile for ASP.NET Core Web API (.NET 9)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["SMS.API/SMS.API.csproj", "SMS.API/"]
COPY ["SMS.Application/SMS.Application.csproj", "SMS.Application/"]
COPY ["SMS.Domain/SMS.Domain.csproj", "SMS.Domain/"]
COPY ["SMS.Infrastructure/SMS.Infrastructure.csproj", "SMS.Infrastructure/"]

RUN dotnet restore "SMS.API/SMS.API.csproj"

# Copy full source code and build
COPY . .
WORKDIR "/src/SMS.API"
RUN dotnet publish "SMS.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Render runtime configuration & Linux container stability fixes
ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_EnableDiagnostics=0
ENV DOTNET_RUNNING_IN_CONTAINER=true
ENV DOTNET_USE_POLLING_FILE_WATCHER=true
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

ENTRYPOINT ["dotnet", "SMS.API.dll"]

