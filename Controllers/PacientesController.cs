using Microsoft.AspNetCore.Mvc;
using HospitalApi.Models;
using HospitalApi.Data;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HospitalApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PacientesController : ControllerBase
    {
        private readonly AppDbContext _context;
        // Listado estático oficial de médicos
        private readonly string[] MedicosAutorizados = { "MED-1010", "MED-2020", "MED-3030", "MED-4040", "MED-5050" };

        public PacientesController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/pacientes/registro
        [HttpPost("registro")]
        public IActionResult RegistrarPaciente([FromBody] PacienteDTO request)
        {
            // 1. Validación de Autorización (401 Unauthorized)
            if (!MedicosAutorizados.Contains(request.MedicoCarnet))
            {
                return Unauthorized(new { mensaje = "Carnet de médico no autorizado." });
            }

            // 2. Validación de Capacidad Crítica (400 Bad Request)
            if (request.Gravedad == 5)
            {
                int criticosEnEspera = _context.Pacientes.Count(p => p.Gravedad == 5 && p.Estado == "En espera");
                if (criticosEnEspera >= 5)
                {
                    return BadRequest(new { mensaje = "Capacidad máxima alcanzada. Redirección inmediata a otro hospital sugerida." });
                }
            }

            // 3. Generación del ID (Formato: PAC-2026-XXX)
            // 3. Generación del ID (A prueba de eliminaciones)
                        string milisegundos = DateTime.Now.ToString("fff");
                        int aleatorio = new Random().Next(10, 99);
                        string nuevoId = $"PAC-2026-{milisegundos}{aleatorio}";
            // Construir el paciente a guardar
            var nuevoPaciente = new Paciente
            {
                PacienteId = nuevoId,
                NombreCompleto = request.NombreCompleto,
                Gravedad = request.Gravedad,
                Sintomas = request.Sintomas,
                Estado = "En espera", // Estado inicial obligatorio
                MedicoCarnet = request.MedicoCarnet,
                FechaIngreso = DateTime.Now // Captura la fecha y hora exacta del sistema
            };

            _context.Pacientes.Add(nuevoPaciente);
            _context.SaveChanges();

            return Ok(nuevoPaciente);
        }

        // GET: api/pacientes
        [HttpGet]
        public IActionResult ObtenerPacientesOrdenados()
        {
            // Extraer todos los pacientes sin usar ORDER BY de SQL
            List<Paciente> lista = _context.Pacientes.ToList();

            // Algoritmo de Ordenamiento Manual: Selección (Selection Sort)
            int n = lista.Count;
            for (int i = 0; i < n - 1; i++)
            {
                int indiceMayor = i;
                for (int j = i + 1; j < n; j++)
                {
                    // Prioridad 1: Mayor gravedad (Descendente 5 a 1)
                    if (lista[j].Gravedad > lista[indiceMayor].Gravedad)
                    {
                        indiceMayor = j;
                    }
                    // Prioridad 2: A igual gravedad, prioridad por fecha más antigua
                    else if (lista[j].Gravedad == lista[indiceMayor].Gravedad)
                    {
                        if (lista[j].FechaIngreso < lista[indiceMayor].FechaIngreso)
                        {
                            indiceMayor = j;
                        }
                    }
                }
                
                // Intercambio
                var temp = lista[indiceMayor];
                lista[indiceMayor] = lista[i];
                lista[i] = temp;
            }

            return Ok(lista);
        }

            // 1. MÉTODO PARA ELIMINAR (Para el botón rojo)
[HttpDelete("{id}")]
public async Task<IActionResult> EliminarPaciente(string id)
{
    var paciente = await _context.Pacientes.FindAsync(id);
    if (paciente == null) return NotFound();
    
    _context.Pacientes.Remove(paciente);
    await _context.SaveChangesAsync();
    return Ok();
}

// 2. MÉTODO PARA MARCAR ATENDIDO (Para el botón azul)
[HttpPut("{id}/atendido")]
public async Task<IActionResult> MarcarAtendido(string id)
{
    var paciente = await _context.Pacientes.FindAsync(id);
    if (paciente == null) return NotFound();

    paciente.Estado = "Atendido";
    await _context.SaveChangesAsync();
    return Ok();
}

// 3. MÉTODO PARA EDITAR (Para el botón naranja)
[HttpPut("{id}")]
public async Task<IActionResult> EditarPaciente(string id, Paciente pacienteActualizado)
{
    var paciente = await _context.Pacientes.FindAsync(id);
    if (paciente == null) return NotFound();

    paciente.NombreCompleto = pacienteActualizado.NombreCompleto;
    paciente.Gravedad = pacienteActualizado.Gravedad;
    paciente.Sintomas = pacienteActualizado.Sintomas;
    // Actualiza los demás campos necesarios...
    
    await _context.SaveChangesAsync();
    return Ok();
}
    }

    // Objeto de Transferencia de Datos (DTO) para la petición POST
    public class PacienteDTO
    {
        public string NombreCompleto { get; set; } = string.Empty;
        public int Gravedad { get; set; }
        public string MedicoCarnet { get; set; } = string.Empty;
        public string Sintomas { get; set; } = string.Empty;
    }
}