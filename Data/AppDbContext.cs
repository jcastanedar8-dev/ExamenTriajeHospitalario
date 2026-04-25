using Microsoft.EntityFrameworkCore;
using HospitalApi.Models;

namespace HospitalApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Paciente> Pacientes { get; set; }
    }
}