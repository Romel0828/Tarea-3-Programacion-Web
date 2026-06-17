/* =========================================
   AGENDA MULTICAPAS — app.js
   Programación WEB · ITLA 2026
   =========================================
   Capa de datos  : API externa (raydelto.org)
   Capa de lógica : fetch GET / POST
   Capa de vista  : manipulación del DOM

   NOTA: Se usa corsproxy.io para evitar bloqueos
   de mixed-content cuando la app se sirve por HTTPS
   (ej. GitHub Pages). Si el profe la abre directo
   desde el archivo también funciona.
*/

const API_BASE = "http://www.raydelto.org/agenda.php";
const PROXY    = "https://corsproxy.io/?url=";
const API_URL  = PROXY + encodeURIComponent(API_BASE);

// ── Referencias al DOM ─────────────────────────────────────────────────────
const inputNombre   = document.getElementById("nombre");
const inputApellido = document.getElementById("apellido");
const inputTelefono = document.getElementById("telefono");
const btnAgregar    = document.getElementById("btn-agregar");
const mensajeEl     = document.getElementById("mensaje");
const listaEl       = document.getElementById("lista-contactos");
const loadingEl     = document.getElementById("loading");
const errorEl       = document.getElementById("error-msg");
const emptyEl       = document.getElementById("empty-msg");
const countEl       = document.getElementById("contact-count");
const buscadorEl    = document.getElementById("buscador");

// ── Estado local ───────────────────────────────────────────────────────────
var contactos = [];

// ══════════════════════════════════════════════════════════════════════════
// CAPA DE DATOS — Obtener contactos (HTTP GET)
// ══════════════════════════════════════════════════════════════════════════
async function obtenerContactos() {
  mostrarEstado("loading");

  try {
    var response = await fetchConFallback(API_BASE, { method: "GET" });

    if (!response.ok) {
      throw new Error("Error del servidor: " + response.status);
    }

    var texto = await response.text();
    var data;

    try {
      data = JSON.parse(texto);
    } catch (_) {
      throw new Error("La respuesta del servidor no es JSON válido.");
    }

    contactos = Array.isArray(data) ? data : (data.contactos || []);
    renderizarLista(contactos);

  } catch (error) {
    console.error("Error al obtener contactos:", error);
    mostrarEstado("error", "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.");
  }
}

// ══════════════════════════════════════════════════════════════════════════
// CAPA DE DATOS — Agregar contacto (HTTP POST)
// ══════════════════════════════════════════════════════════════════════════
async function agregarContacto(nombre, apellido, telefono) {
  setBtnLoading(true);
  setMensaje("", "");

  var payload = JSON.stringify({ nombre: nombre, apellido: apellido, telefono: telefono });

  try {
    var response = await fetchConFallback(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload
    });

    if (!response.ok) {
      throw new Error("Error del servidor: " + response.status);
    }

    setMensaje("✔ Contacto agregado correctamente.", "ok");
    limpiarFormulario();
    await obtenerContactos();

  } catch (error) {
    console.error("Error al agregar contacto:", error);
    setMensaje("✖ No se pudo agregar el contacto. Intenta de nuevo.", "err");
  } finally {
    setBtnLoading(false);
  }
}

// ══════════════════════════════════════════════════════════════════════════
// FETCH CON FALLBACK
// Intenta primero con el proxy (HTTPS), si falla intenta directo.
// Esto cubre tanto GitHub Pages como abrir el archivo desde el PC.
// ══════════════════════════════════════════════════════════════════════════
async function fetchConFallback(url, opciones) {
  var urlProxy = PROXY + encodeURIComponent(url);

  try {
    var res = await fetch(urlProxy, opciones);
    return res;
  } catch (errProxy) {
    console.warn("Proxy falló, intentando directo:", errProxy);
    return await fetch(url, opciones);
  }
}

// ══════════════════════════════════════════════════════════════════════════
// CAPA DE VISTA — Renderizar lista de contactos
// ══════════════════════════════════════════════════════════════════════════
function renderizarLista(lista) {
  listaEl.innerHTML = "";
  countEl.textContent = contactos.length;

  if (lista.length === 0) {
    mostrarEstado("empty");
    return;
  }

  mostrarEstado("list");

  lista.forEach(function(c) {
    var nombre   = c.nombre   || "";
    var apellido = c.apellido || "";
    var telefono = c.telefono || "—";
    var iniciales = obtenerIniciales(nombre, apellido);

    var li = document.createElement("li");
    li.className = "contact-item";
    li.innerHTML =
      '<div class="avatar">' + iniciales + '</div>' +
      '<div class="contact-info">' +
        '<div class="contact-name">' + escaparHTML(nombre) + " " + escaparHTML(apellido) + '</div>' +
        '<div class="contact-phone">&#128222; ' + escaparHTML(telefono) + '</div>' +
      '</div>';
    listaEl.appendChild(li);
  });
}

// ══════════════════════════════════════════════════════════════════════════
// CAPA DE VISTA — Filtrar contactos con buscador
// ══════════════════════════════════════════════════════════════════════════
function filtrarContactos(termino) {
  var t = termino.trim().toLowerCase();
  if (!t) {
    renderizarLista(contactos);
    return;
  }
  var filtrados = contactos.filter(function(c) {
    var texto = (c.nombre + " " + c.apellido + " " + c.telefono).toLowerCase();
    return texto.indexOf(t) !== -1;
  });
  renderizarLista(filtrados);
}

// ══════════════════════════════════════════════════════════════════════════
// VALIDACIÓN
// ══════════════════════════════════════════════════════════════════════════
function validarFormulario(nombre, apellido, telefono) {
  if (!nombre.trim()) {
    setMensaje("⚠ El nombre es obligatorio.", "err");
    inputNombre.focus();
    return false;
  }
  if (!apellido.trim()) {
    setMensaje("⚠ El apellido es obligatorio.", "err");
    inputApellido.focus();
    return false;
  }
  if (!telefono.trim()) {
    setMensaje("⚠ El teléfono es obligatorio.", "err");
    inputTelefono.focus();
    return false;
  }
  return true;
}

// ══════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ══════════════════════════════════════════════════════════════════════════
function mostrarEstado(estado, errorMsg) {
  loadingEl.classList.add("hidden");
  errorEl.classList.add("hidden");
  emptyEl.classList.add("hidden");

  if (estado === "loading") {
    loadingEl.classList.remove("hidden");
  } else if (estado === "error") {
    errorEl.textContent = errorMsg || "Error desconocido.";
    errorEl.classList.remove("hidden");
  } else if (estado === "empty") {
    emptyEl.classList.remove("hidden");
  }
  // "list" → no muestra ningún mensaje de estado
}

function setMensaje(texto, tipo) {
  mensajeEl.textContent = texto;
  mensajeEl.className = "mensaje " + tipo;
}

function setBtnLoading(cargando) {
  btnAgregar.disabled = cargando;
  btnAgregar.innerHTML = cargando
    ? "Guardando..."
    : '<span class="btn-icon">+</span> Agregar Contacto';
}

function limpiarFormulario() {
  inputNombre.value   = "";
  inputApellido.value = "";
  inputTelefono.value = "";
  inputNombre.focus();
}

function obtenerIniciales(nombre, apellido) {
  var n = nombre.charAt(0).toUpperCase();
  var a = apellido.charAt(0).toUpperCase();
  return (n + a) || "?";
}

function escaparHTML(texto) {
  return String(texto)
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#39;");
}

// ══════════════════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ══════════════════════════════════════════════════════════════════════════
btnAgregar.addEventListener("click", function() {
  var nombre   = inputNombre.value;
  var apellido = inputApellido.value;
  var telefono = inputTelefono.value;

  if (!validarFormulario(nombre, apellido, telefono)) return;

  agregarContacto(nombre.trim(), apellido.trim(), telefono.trim());
});

[inputNombre, inputApellido, inputTelefono].forEach(function(input) {
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") btnAgregar.click();
  });
});

buscadorEl.addEventListener("input", function(e) {
  filtrarContactos(e.target.value);
});

// ══════════════════════════════════════════════════════════════════════════
// INICIO
// ══════════════════════════════════════════════════════════════════════════
obtenerContactos();
