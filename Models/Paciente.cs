using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; // 1. Agrega esta línea

namespace HospitalApi.Models
{
    [Table("Triaje_Jeison")] // 2. Agrega esta etiqueta para usar un nombre de tabla único
    public class Paciente
    {
        [Key]
        public string PacienteId { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public int Gravedad { get; set; } 
        public string Sintomas { get; set; } = string.Empty;
        public string Estado { get; set; } = "En espera"; 
        public string MedicoCarnet { get; set; } = string.Empty;
        public DateTime FechaIngreso { get; set; }
    }
}