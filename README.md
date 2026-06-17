# 📋 Agenda Multicapas

**Tarea 3 — Programación WEB · ITLA 2026**  
Profesor: Raydelto Hernández

---

## Descripción

Aplicación web para gestionar una agenda de contactos. Permite **listar** y **agregar** contactos a través de una API externa usando `fetch` con los métodos HTTP **GET** y **POST**.

---

## Estructura del proyecto

```
agenda-multicapas/
├── index.html        ← Estructura HTML5
├── css/
│   └── styles.css    ← Estilos CSS3 (dark mode)
└── js/
    └── app.js        ← Lógica JavaScript (fetch, DOM)
```

---

## Funcionalidades

- ✅ Listar todos los contactos guardados en la agenda (GET)
- ✅ Agregar nuevos contactos (POST)
- ✅ Buscador en tiempo real por nombre, apellido o teléfono
- ✅ Validación de campos antes de enviar
- ✅ Manejo de errores de red
- ✅ Diseño responsive (mobile-friendly)

---

## API utilizada

**Base URL:** `http://www.raydelto.org/agenda.php`

| Método | Acción |
|--------|--------|
| `GET`  | Obtener todos los contactos en formato JSON |
| `POST` | Agregar un contacto enviando `{ nombre, apellido, telefono }` |

---

## Cómo ejecutar

1. Clonar o descargar el repositorio
2. Abrir `index.html` en el navegador

> ⚠️ El navegador puede bloquear peticiones HTTP desde una página servida por HTTPS (mixed content). Se recomienda abrir el archivo directamente o usar un servidor local como [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) de VS Code.

---

## Tecnologías

- HTML5
- CSS3
- JavaScript ES5 / Fetch API
