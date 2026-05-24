const libros = [
  {
    titulo: "El principito",
    autor: "Antoine de Saint-Exupery",
    categoria: "Infantil",
    cantidad: 5,
    prestados: 2
  },
  {
    titulo: "Cien anos de soledad",
    autor: "Gabriel Garcia Marquez",
    categoria: "Novela",
    cantidad: 4,
    prestados: 3
  },
  {
    titulo: "Breve historia del tiempo",
    autor: "Stephen Hawking",
    categoria: "Ciencia",
    cantidad: 3,
    prestados: 1
  },
  {
    titulo: "Clean Code",
    autor: "Robert C. Martin",
    categoria: "Tecnologia",
    cantidad: 2,
    prestados: 2
  },
  {
    titulo: "Sapiens",
    autor: "Yuval Noah Harari",
    categoria: "Historia",
    cantidad: 6,
    prestados: 1
  },
  {
    titulo: "La sombra del viento",
    autor: "Carlos Ruiz Zafon",
    categoria: "Novela",
    cantidad: 3,
    prestados: 0
  }
];

const prestamos = [
  {
    usuario: "Laura Mendez",
    libro: "Cien anos de soledad",
    limite: "2026-05-28",
    estado: "Activo"
  },
  {
    usuario: "Carlos Rojas",
    libro: "Clean Code",
    limite: "2026-05-26",
    estado: "Por vencer"
  },
  {
    usuario: "Ana Torres",
    libro: "El principito",
    limite: "2026-06-02",
    estado: "Activo"
  }
];

const listaLibros = document.querySelector("#listaLibros");
const tablaPrestamos = document.querySelector("#tablaPrestamos");
const busqueda = document.querySelector("#busqueda");
const formLibro = document.querySelector("#formLibro");
const totalLibros = document.querySelector("#totalLibros");
const disponibles = document.querySelector("#disponibles");
const prestados = document.querySelector("#prestados");

function obtenerDisponibles(libro) {
  return Math.max(libro.cantidad - libro.prestados, 0);
}

function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function escapeHtml(texto) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderMetricas() {
  const total = libros.reduce((sum, libro) => sum + libro.cantidad, 0);
  const totalPrestados = libros.reduce((sum, libro) => sum + libro.prestados, 0);

  totalLibros.textContent = total;
  prestados.textContent = totalPrestados;
  disponibles.textContent = total - totalPrestados;
}

function renderLibros(filtro = "") {
  const termino = normalizar(filtro);
  const filtrados = libros.filter((libro) => {
    const contenido = `${libro.titulo} ${libro.autor} ${libro.categoria}`;
    return normalizar(contenido).includes(termino);
  });

  listaLibros.innerHTML = "";

  if (filtrados.length === 0) {
    listaLibros.innerHTML = '<p class="empty">No se encontraron libros con ese criterio.</p>';
    return;
  }

  filtrados.forEach((libro) => {
    const disponiblesLibro = obtenerDisponibles(libro);
    const libroIndex = libros.indexOf(libro);
    const card = document.createElement("article");
    card.className = "book-card";
    card.innerHTML = `
      <div>
        <h3>${escapeHtml(libro.titulo)}</h3>
        <p>${escapeHtml(libro.autor)}</p>
      </div>
      <div>
        <div class="book-meta">
          <span class="tag category">${escapeHtml(libro.categoria)}</span>
          <span class="tag ${disponiblesLibro > 0 ? "available" : "borrowed"}">
            ${disponiblesLibro > 0 ? `${disponiblesLibro} disponibles` : "Sin disponibilidad"}
          </span>
        </div>
        <div class="card-actions">
          <button type="button" data-action="prestar" data-index="${libroIndex}" ${disponiblesLibro === 0 ? "disabled" : ""}>Prestar</button>
          <button type="button" data-action="devolver" data-index="${libroIndex}" ${libro.prestados === 0 ? "disabled" : ""}>Devolver</button>
        </div>
      </div>
    `;
    listaLibros.appendChild(card);
  });
}

function renderPrestamos() {
  tablaPrestamos.innerHTML = "";

  prestamos.forEach((prestamo) => {
    const fila = document.createElement("tr");
    const estadoClase = prestamo.estado === "Por vencer" ? "status due-soon" : "status";

    fila.innerHTML = `
      <td>${prestamo.usuario}</td>
      <td>${prestamo.libro}</td>
      <td>${prestamo.limite}</td>
      <td><span class="${estadoClase}">${prestamo.estado}</span></td>
    `;

    tablaPrestamos.appendChild(fila);
  });
}

busqueda.addEventListener("input", (event) => {
  renderLibros(event.target.value);
});

listaLibros.addEventListener("click", (event) => {
  const boton = event.target.closest("button[data-action]");

  if (!boton) {
    return;
  }

  const libro = libros[Number(boton.dataset.index)];

  if (!libro) {
    return;
  }

  if (boton.dataset.action === "prestar" && obtenerDisponibles(libro) > 0) {
    libro.prestados += 1;
  }

  if (boton.dataset.action === "devolver" && libro.prestados > 0) {
    libro.prestados -= 1;
  }

  renderMetricas();
  renderLibros(busqueda.value);
});

formLibro.addEventListener("submit", (event) => {
  event.preventDefault();

  const datos = new FormData(formLibro);
  libros.unshift({
    titulo: datos.get("titulo").trim(),
    autor: datos.get("autor").trim(),
    categoria: datos.get("categoria"),
    cantidad: Number(datos.get("cantidad")),
    prestados: 0
  });

  formLibro.reset();
  formLibro.cantidad.value = 1;
  renderMetricas();
  renderLibros(busqueda.value);
});

renderMetricas();
renderLibros();
renderPrestamos();
