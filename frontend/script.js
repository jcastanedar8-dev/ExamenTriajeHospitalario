const API_URL = "https://triaje-jeison-umg-h9bjcpa2fkc2drgg.eastus-01.azurewebsites.net/api/pacientes";

// Función para cambiar entre pestañas
function mostrarSeccion(seccion) {
    document.getElementById('seccion-ver').style.display = seccion === 'ver' ? 'block' : 'none';
    document.getElementById('seccion-registrar').style.display = seccion === 'registrar' ? 'block' : 'none';
    if(seccion === 'ver') cargarPacientes();
}

// GET: Obtener pacientes de Azure
async function cargarPacientes() {
    try {
        const response = await fetch(API_URL);
        const pacientes = await response.json();
        const contenedor = document.getElementById('contenedor-pacientes');
        contenedor.innerHTML = "";

        pacientes.forEach(p => {
            const esCritico = p.gravedad === 5 ? "prioridad-maxima" : "";
            contenedor.innerHTML += `
                <div class="card ${esCritico}">
                    <h3>${p.nombreCompleto}</h3>
                    <p><strong>ID:</strong> ${p.pacienteId}</p>
                    <p><strong>Gravedad:</strong> ${p.gravedad}</p>
                    <p><strong>Estado:</strong> ${p.estado}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error al cargar datos:", error);
    }
}

// POST: Registrar nuevo paciente
document.getElementById('form-registro').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nuevoPaciente = {
        nombreCompleto: document.getElementById('nombre').value,
        gravedad: parseInt(document.getElementById('gravedad').value),
        medicoCarnet: document.getElementById('carnet').value
    };

    try {
        const response = await fetch(`${API_URL}/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoPaciente)
        });

        if (response.status === 200) {
            alert("¡Paciente registrado con éxito!");
            mostrarSeccion('ver');
        } else if (response.status === 401) {
            alert("Acceso Denegado: Carnet de médico inválido.");
        } else if (response.status === 400) {
            alert("Error: Capacidad máxima de pacientes críticos alcanzada.");
        }
    } catch (error) {
        alert("Hubo un problema con la conexión al servidor.");
    }
});

// Cargar datos al iniciar
cargarPacientes();