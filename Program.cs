using HospitalApi.Data;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar conexión a MySQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// 2. Agregar Controladores
builder.Services.AddControllers();

// 3. Configurar OpenAPI para Scalar
builder.Services.AddOpenApi();
// linea agregada 09-
builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});



var app = builder.Build();
app.UseCors();

// 4. Activar Scalar para la documentación (Accesible en /scalar)
app.MapOpenApi();
app.MapScalarApiReference(); 

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
