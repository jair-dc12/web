

// Variables globales y carga inicial de productos
let productos = [];

fetch("./js/productos.json")
    .then(response => response.json())
    .then(data => {
        productos = data;
        cargarProductos(productos);
    });

const contenedorProductos = document.querySelector(".contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-menu");
const tituloPrincipal = document.querySelector(".titulo-principal");
let botonesAgregar = document.querySelectorAll(".producto-agregar");
const numerito = document.querySelector(".numerito");

botonesCategorias.forEach(boton => {
    boton.addEventListener("click", (e) => {
        // Remover la clase 'active' de todos los botones
        botonesCategorias.forEach(boton => boton.classList.remove("active"));
        // Agregar la clase 'active' solo al botón clickeado
        e.currentTarget.classList.add("active");

        // Obtener la categoría seleccionada
        const categoriaSeleccionada = e.currentTarget.id;

        // Filtrar los productos según la categoría seleccionada
        if (categoriaSeleccionada === "todos") {
            tituloPrincipal.innerText = "Todos los productos";
            cargarProductos(productos);
        } else {
            const productosFiltrados = productos.filter(producto => producto.categoria.id === categoriaSeleccionada);
            tituloPrincipal.innerText = e.currentTarget.innerText.trim();
            cargarProductos(productosFiltrados);
        }
    });
});

function cargarProductos(productosElegidos) {
    contenedorProductos.innerHTML = "";

    productosElegidos.forEach(producto => {
        const div = document.createElement("div");
        div.classList.add("producto");
        div.innerHTML = `
            <img class="producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
            <div class="producto-detalles">
                <h3 class="producto-titulo">${producto.titulo}</h3>
                <p class="producto-precio">$${producto.precio}</p>
                <button class="producto-agregar" id="${producto.id}">Agregar</button>
            </div>
        `;

        // Agregar evento click para abrir modal de selección de sabores si el producto tiene sabores
        div.querySelector(".producto-agregar").addEventListener("click", () => {
            if (producto.sabores && producto.sabores.length > 0) {
                abrirModalSabores(producto);
            } else {
                agregarAlCarritoDirectamente(producto);
            }
        });

        contenedorProductos.appendChild(div);
    });

    actualizarBotonesAgregar();
}

function actualizarBotonesAgregar() {
    botonesAgregar = document.querySelectorAll(".producto-agregar");

    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", agregarAlCarrito);
    });
}

let productosEnCarrito;

let productosEnCarritoLS = localStorage.getItem("productos-en-carrito");

if (productosEnCarritoLS) {
    productosEnCarrito = JSON.parse(productosEnCarritoLS);
    actualizarNumerito();
} else {
    productosEnCarrito = [];
}

function agregarAlCarrito(e) {
    Toastify({
        text: "Producto agregado",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "linear-gradient(to right, #4b33a8, #785ce9)",
          borderRadius: "2rem",
          textTransform: "uppercase",
          fontSize: ".75rem"
        },
        offset: {
            x: '1.5rem',
            y: '1.5rem'
          },
        onClick: function(){}
      }).showToast();

    const idBoton = e.currentTarget.id;
    const productoAgregado = productos.find(producto => producto.id === idBoton);

    if(productosEnCarrito.some(producto => producto.id === idBoton)) {
        const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
        productosEnCarrito[index].cantidad++;
    } else {
        productoAgregado.cantidad = 1;
        productosEnCarrito.push(productoAgregado);
    }

    actualizarNumerito();

    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

function actualizarNumerito() {
    let nuevoNumerito = productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0);
    numerito.innerText = nuevoNumerito;
}

// Modal de selección de sabores
const modalSabores = document.getElementById("modal-sabores");
const btnAgregarAlCarrito = document.getElementById("agregar-al-carrito");
const formSabores = document.getElementById("form-sabores");
const previewSabor = document.getElementById("preview-sabor");
const cerrarModal = document.getElementById("cerrar-modal");

let cantidadProductos = 1;
const cantidadSeleccionada = document.getElementById("cantidad-seleccionada");
const btnRestarCantidad = document.getElementById("restar-cantidad");
const btnSumarCantidad = document.getElementById("sumar-cantidad");

btnRestarCantidad.addEventListener("click", () => {
    if (cantidadProductos > 1) {
        cantidadProductos--;
        cantidadSeleccionada.innerText = cantidadProductos;
    }
});

btnSumarCantidad.addEventListener("click", () => {
    cantidadProductos++;
    cantidadSeleccionada.innerText = cantidadProductos;
});

window.addEventListener("click", (e) => {
    if (e.target === modalSabores) {
        modalSabores.style.display = "none";
    }
});

// Variable global para almacenar el producto seleccionado
let productoSeleccionado = null;

// Función para abrir el modal de sabores y mostrar la imagen del primer sabor
function abrirModalSabores(producto) {
    productoSeleccionado = producto;
    modalSabores.style.display = "block";
    cargarRadioButtonsSabores(producto.sabores);
    cantidadProductos = 1;  // Restablecer cantidad a 1 al abrir modal
    cantidadSeleccionada.innerText = cantidadProductos;  // Actualizar cantidad mostrada
    
    // Seleccionar por defecto el primer sabor
    if (producto.sabores.length > 0) {
        const primerSabor = producto.sabores[0];
        document.getElementById(primerSabor.id).checked = true;
        mostrarPreviewSabor(primerSabor.imagen);  // Mostrar la imagen del primer sabor seleccionado
    }
}

// Cerrar el modal de sabores
function cerrarModalSabores() {
    modalSabores.style.display = "none";
}

cerrarModal.addEventListener('click', cerrarModalSabores);

function cargarRadioButtonsSabores(sabores) {
    formSabores.innerHTML = "";
    sabores.forEach(sabor => {
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "sabor";
        input.value = sabor.id;
        input.id = sabor.id;
        input.addEventListener("change", () => mostrarPreviewSabor(sabor.imagen));

        const label = document.createElement("label");
        label.htmlFor = sabor.id;
        label.textContent = sabor.nombre;

        formSabores.appendChild(input);
        formSabores.appendChild(label);
    });

    // Mostrar el primer sabor como predeterminado
    if (sabores.length > 0) {
        mostrarPreviewSabor(sabores[0].imagen);
    }
}

function mostrarPreviewSabor(imagen) {
    previewSabor.innerHTML = `<img src="${imagen}" alt="Preview del sabor">`;
}

// Función de inicialización
function inicializar() {
    botonesAgregar = document.querySelectorAll(".producto-agregar");
    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", agregarAlCarrito);
    });
}

inicializar();
