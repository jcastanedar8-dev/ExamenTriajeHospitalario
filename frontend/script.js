const API_URL = "https://triaje-jeison-umg-h9bjcpa2fkc2drgg.eastus-01.azurewebsites.net/api/pacientes";

// Función para cambiar entre pestañas
// Función para cambiar entre pestañas
function mostrarSeccion(seccion) {
    // 1. Apagar o encender las secciones según el botón presionado
    document.getElementById('seccion-ver').style.display = seccion === 'ver' ? 'block' : 'none';
    document.getElementById('seccion-registrar').style.display = seccion === 'registrar' ? 'block' : 'none';
    document.getElementById('seccion-editar').style.display = seccion === 'editar' ? 'block' : 'none';
    document.getElementById('seccion-reportes').style.display = seccion === 'reportes' ? 'block' : 'none'; // <--- ESTA LÍNEA MUESTRA EL REPORTE
    
    // 2. Cargar los datos frescos dependiendo de dónde entremos
    if(seccion === 'ver') cargarPacientes();
    if(seccion === 'reportes') generarReporte(); // <--- ESTA LÍNEA CALCULA EL PDF Y LA TABLA
}
// GET: Obtener pacientes
// GET: Obtener pacientes (SOLO PENDIENTES)
async function cargarPacientes() {
    try {
        const response = await fetch(API_URL);
        const pacientes = await response.json();
        const contenedor = document.getElementById('contenedor-pacientes');
        contenedor.innerHTML = "";

        // FILTRO KAIZEN: Extraer solo los que NO están Atendidos
        const pacientesPendientes = pacientes.filter(p => p.estado !== 'Atendido');

        // Si ya no hay nadie en espera, mostramos un mensaje de victoria
        if (pacientesPendientes.length === 0) {
            contenedor.innerHTML = "<p style='grid-column: 1 / -1; text-align: center; font-size: 1.2rem; margin-top: 50px;'>No hay pacientes en espera. ¡Excelente trabajo de triaje!</p>";
            return;
        }

        // Dibujar solo las tarjetas de los pendientes
        pacientesPendientes.forEach(p => {
            const esCritico = p.gravedad === 5 ? "prioridad-maxima" : "";
            
            contenedor.innerHTML += `
                <div class="card ${esCritico}">
                    <h3>${p.nombreCompleto}</h3>
                    <p><strong>ID:</strong> ${p.pacienteId}</p>
                    <p><strong>Gravedad:</strong> ${p.gravedad}</p>
                    <p><strong>Estado:</strong> ${p.estado}</p>
                    <hr>
                    <div class="acciones">
                        <button onclick="marcarAtendido('${p.pacienteId}')" class="btn-accion btn-atendido">✔ Atender</button>
                        <button onclick="prepararEdicion('${p.pacienteId}', '${p.nombreCompleto}', ${p.gravedad})" class="btn-accion btn-editar">✏ Editar</button>
                        <button onclick="eliminarPaciente('${p.pacienteId}')" class="btn-accion btn-eliminar">🗑 Eliminar</button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error al cargar datos:", error);
    }
}

// DELETE: Eliminar paciente
async function eliminarPaciente(id) {
    // Aquí está el mensaje de advertencia que pediste
    const confirmacion = confirm("🚨 ¡ADVERTENCIA EXTREMA!\n\nEsta acción NO se puede revertir. ¿Estás absolutamente seguro de que deseas eliminar este paciente del sistema?");
    
    if (confirmacion) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert("Paciente eliminado del sistema.");
                cargarPacientes();
            } else {
                alert("Error al eliminar. Revisa si tu API C# tiene el método DELETE programado.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
}

// PUT / PATCH: Marcar como atendido
async function marcarAtendido(id) {
    try {
        // NOTA: Esto asume que tu API tiene una ruta específica para cambiar el estado.
        // Si tienes una ruta diferente en C#, debes cambiar esta URL.
        const response = await fetch(`${API_URL}/${id}/atendido`, { method: 'PUT' });
        
        if (response.ok) {
            cargarPacientes();
        } else {
            alert("No se pudo actualizar el estado. Revisa tu controlador en C#.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// PREPARAR EDICIÓN: Llena el formulario oculto con los datos actuales
function prepararEdicion(id, nombre, gravedad) {
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-nombre').value = nombre;
    document.getElementById('edit-gravedad').value = gravedad;
    mostrarSeccion('editar');
}

// PUT: Guardar cambios de edición
document.getElementById('form-editar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const datosActualizados = {
        pacienteId: id,
        nombreCompleto: document.getElementById('edit-nombre').value,
        gravedad: parseInt(document.getElementById('edit-gravedad').value)
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });

        if (response.ok) {
            alert("¡Registro actualizado exitosamente!");
            mostrarSeccion('ver');
        } else {
            alert("Error al modificar. Revisa si tu API C# tiene el método PUT programado.");
        }
    } catch (error) {
        alert("Hubo un problema con la conexión.");
    }
});

// POST: Registrar nuevo paciente (se mantiene igual)
// POST: Registrar nuevo paciente
document.getElementById('form-registro').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // AQUÍ ESTÁ EL CAMBIO: Agregamos la línea para atrapar los "sintomas"
    const nuevoPaciente = {
        nombreCompleto: document.getElementById('nombre').value,
        gravedad: parseInt(document.getElementById('gravedad').value),
        sintomas: document.getElementById('sintomas').value, // <--- ESTA ES LA PIEZA CLAVE
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
            document.getElementById('form-registro').reset();
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
// GET: Generar Reporte de Atendidos
// GET: Generar Reporte Estadístico
async function generarReporte() {
    try {
        const response = await fetch(API_URL);
        const pacientes = await response.json();
        
        // 1. Calcular las Matemáticas
        const totalIngresados = pacientes.length;
        const atendidos = pacientes.filter(p => p.estado === 'Atendido');
        const enEspera = pacientes.filter(p => p.estado !== 'Atendido');

        // 2. Actualizar contadores en pantalla
        document.getElementById('total-ingresados').innerText = totalIngresados;
        document.getElementById('total-espera').innerText = enEspera.length;
        document.getElementById('total-atendidos').innerText = atendidos.length;

        // 3. Llenar la Tabla solo con Atendidos
        const tbody = document.getElementById('cuerpo-reporte');
        tbody.innerHTML = "";

        if(atendidos.length === 0) {
            tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; padding:20px;'>No hay pacientes atendidos aún.</td></tr>";
            return;
        }

        atendidos.forEach(p => {
            // Formatear la fecha para que se vea legible
            const fecha = new Date(p.fechaIngreso).toLocaleString();
            
            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px;"><strong>${p.pacienteId}</strong></td>
                    <td style="padding: 12px;">${p.nombreCompleto}</td>
                    <td style="padding: 12px;"><span style="background: #e74c3c; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.85rem;">Nivel ${p.gravedad}</span></td>
                    <td style="padding: 12px;">${p.sintomas || 'Sin registro detallado'}</td>
                    <td style="padding: 12px;">${p.medicoCarnet || 'No asignado'}</td>
                    <td style="padding: 12px;">${fecha}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al cargar reporte:", error);
    }
}

// Función nativa para generar PDF sin librerías pesadas
function imprimirReporte() {
    window.print();
}

// Cargar datos al iniciar
cargarPacientes();