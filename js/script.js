// Rutas / selectores - CORREGIDO
const categoriasContainer = document.getElementById("categorias-container");
const productosContainer = document.getElementById("productos-container");

const productoModal = document.getElementById("producto-modal");
const detalleImg = document.getElementById("detalle-img");
const detalleNombre = document.getElementById("detalle-nombre");
const detalleDescripcion = document.getElementById("detalle-descripcion");
const opcionesColores = document.getElementById("opciones-colores");
const opcionesMaterial = document.getElementById("opciones-material");
const opcionMaterialWrapper = document.getElementById("opcion-material-wrapper");
const detallePrecio = document.getElementById("detalle-precio");
const btnAgregarCarrito = document.getElementById("btn-agregar-carrito");
const btnCancelar = document.getElementById("btn-cancelar");
const cerrarProducto = document.getElementById("cerrar-producto");
const opcionesMedidas = document.getElementById("opciones-medidas");
const medidaPersonalizadaInput = document.getElementById("medida-personalizada");
const opcionColorWrapper = document.getElementById("opcion-color-wrapper");
const opcionesTerminacion = document.getElementById("opciones-terminacion");
const opcionTerminacionWrapper = document.getElementById("opcion-terminacion-wrapper");
const carritoModal = document.getElementById("carrito-modal");
const listaCarrito = document.getElementById("lista-carrito");
const total = document.getElementById("total");
const btnVerCarrito = document.getElementById("verCarrito");
const cerrarCarritoBtn = document.getElementById("cerrar-carrito");
const btnFinalizarCompra = document.getElementById("finalizarCompra");
const cerrarCarritoBtn2 = document.getElementById("cerrarCarrito");

const clienteNombreInput = document.getElementById("cliente-nombre");
const direccionWrapper = document.getElementById("direccion-wrapper");
const clienteDireccion = document.getElementById("cliente-direccion");
const provinciaSelect = document.getElementById("provincia-select");

const btnPersonalizarMedida = document.getElementById("btn-personalizar-medida");
const btnConfirmarMedida = document.getElementById("btn-confirmar-medida");
const personalizadoMedidaWrapper = document.getElementById("personalizado-medida-wrapper");
const confirmacionMedida = document.getElementById("confirmacion-medida");

const btnPersonalizarColor = document.getElementById("btn-personalizar-color");
const btnConfirmarColor = document.getElementById("btn-confirmar-color");
const personalizadoColorWrapper = document.getElementById("personalizado-color-wrapper");
const confirmacionColor = document.getElementById("confirmacion-color");

const opcionAcabadoWrapper = document.getElementById("opcion-acabado-wrapper");
const opcionesAcabado = document.getElementById("opciones-acabado");

const btnRestar = document.getElementById("btn-restar");
const btnSumar = document.getElementById("btn-sumar");
const inputCantidad = document.getElementById("input-cantidad");

const sobreNosotrosContainer = document.getElementById("sobre-nosotros-container");
const btnSobreNosotros = document.querySelectorAll(".btn-nosotros");
const btnVolverInicio = document.getElementById("btn-volver-inicio");

const modalPersonalizacionItem = document.getElementById("modal-personalizacion-item");
const textoPersonalizacion = document.getElementById("texto-personalizacion");
const checkboxDisenoPersonalizado = document.getElementById("checkbox-diseno-personalizado");
const btnGuardarPersonalizacion = document.getElementById("btn-guardar-personalizacion");
const btnCancelarPersonalizacion = document.getElementById("btn-cancelar-personalizacion");

let itemPersonalizandoIndex = null;

// Datos
let data = null;
let carrito = [];
let stockMap = {};
let productoActual = null;
let seleccion = { 
    medida: null, 
    color: null, 
    material: null,
    terminacion: null,
    medidaPersonalizada: null
};

// Número de WhatsApp
const telefonoWhats = "5493547656901";

// Configuración de carruseles para productos específicos
const carruselesProductos = {
    17: ["img/cartelwarning.jpg", "img/alcorte.jpg"], // Cartel logo
    18: ["img/cartelbano.jpg", "img/cartelwifi.jpg"]  // Cartel señalizador
};

let carruselesPortadaActivos = new Map();

// Función para iniciar carrusel en portada de producto
function iniciarCarruselPortada(productoId, imgContainer) {
    const imagenes = carruselesProductos[productoId];
    if (!imagenes || imagenes.length === 0) return;
    
    const imgElement = imgContainer.querySelector('img');
    if (!imgElement) return;
    
    // Usar la primera imagen del carrusel, NO la imagen principal
    imgElement.src = imagenes[0];
    
    // Crear segunda imagen para crossfade
    const imgElement2 = imgElement.cloneNode(true);
    imgElement2.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
    `;
    
    imgContainer.style.position = "relative";
    imgContainer.style.overflow = "hidden";
    imgElement.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        object-fit: contain;
        opacity: 1;
        transition: opacity 0.2s ease-in-out, transform 4s ease-in-out;
    `;
    
    imgContainer.appendChild(imgElement2);
    
    let indiceActual = 0;
    let direccion = 1;
    
    let imagenActiva = imgElement;
    let imagenInactiva = imgElement2;
    
    // Cambiar imagen y dirección cada 4 segundos
    const intervalo = setInterval(() => {
        // Cambiar dirección
        direccion = direccion * -1;
        
        // Siguiente imagen
        indiceActual = (indiceActual + 1) % imagenes.length;
        
        // Establecer nueva imagen en la imagen inactiva
        imagenInactiva.src = imagenes[indiceActual];
        
        // Crossfade
        imagenActiva.style.opacity = "0";
        imagenInactiva.style.opacity = "1";
        
        // Intercambiar referencias
        [imagenActiva, imagenInactiva] = [imagenInactiva, imagenActiva];
    }, 2000);
    
    carruselesPortadaActivos.set(productoId, intervalo);
}


// Función para detener carrusel de portada
function detenerCarruselPortada(productoId) {
    const intervalo = carruselesPortadaActivos.get(productoId);
    if (intervalo) {
        clearInterval(intervalo);
        carruselesPortadaActivos.delete(productoId);
    }
}

// Cargar stock.json
async function cargarStock() {
    categoriasContainer.innerHTML = '<div class="cargando">Cargando categorías...</div>';
    try {
        const resp = await fetch("https://raw.githubusercontent.com/EstebanGranja/colorcopy-stock/main/stock.json");
        if (!resp.ok) throw new Error("No se pudo cargar stock.json");
        data = await resp.json();
        console.log("Datos cargados:", data);
    } catch (e) {
        console.error("Error cargando stock.json, usando fallback demo", e);
        data = {
            categorias: [
                { 
                    id: "Decoracion", 
                    imagen: "img/decoracion.jpg", 
                    productos: [
                        {
                            id: 1,
                            nombre: "Gigantografía Chicas Superpoderosas",
                            descripcion: "Cuadro MDF o PVC, diferentes tamaños y colores.",
                            imagen: "img/decor1_azul.jpg",
                            colores: ["Azul", "Rojo", "Verde"],
                            tamanos: ["Pequeño", "Normal", "Grande"],
                            precios: {"Pequeño": 2500, "Normal": 3500, "Grande": 5000},
                            materiales: ["MDF", "PVC espumado"],
                            stock: 5
                        }
                    ]
                }
            ]
        };
    }
    
    if (data.categorias) {
        data.categorias.forEach(cat => {
            cat.productos = cat.productos || [];
            cat.productos.forEach(p => {
                stockMap[p.id] = p.stock !== undefined ? p.stock : 10;
            });
        });
    }
    
    if (data.categorias) {
        data.categorias.forEach(cat => {
            cat.productos.forEach(p => {
                if (p.tamanos && !p.medidas) p.medidas = p.tamanos;
                if (p.colores && !p.color) p.color = p.colores;
                if (p.materiales && !p.material) p.material = p.materiales;
            });
        });
    }

    mostrarCategorias();
}

// Función para configurar navegación manual de imágenes
function configurarNavegacionManual(productoId) {
    const imagenes = carruselesProductos[productoId];
    
    // Remover flechas existentes
    const flechaIzqExistente = document.getElementById('flecha-izq-modal');
    const flechaDerExistente = document.getElementById('flecha-der-modal');
    if (flechaIzqExistente) flechaIzqExistente.remove();
    if (flechaDerExistente) flechaDerExistente.remove();
    
    // Si no hay carrusel para este producto, mostrar imagen normal
    if (!imagenes || imagenes.length <= 1) {
        detalleImg.src = productoActual.imagen || "img/personalizado.jpg";
        return;
    }
    
    let indiceActual = 0;
    
    // Establecer primera imagen
    detalleImg.src = imagenes[0];
    
    // Crear flecha izquierda
    const flechaIzq = document.createElement('button');
    flechaIzq.id = 'flecha-izq-modal';
    flechaIzq.className = 'flecha-modal flecha-izq';
    flechaIzq.innerHTML = '◀';
    flechaIzq.addEventListener('click', () => {
        indiceActual = (indiceActual - 1 + imagenes.length) % imagenes.length;
        detalleImg.src = imagenes[indiceActual];
    });
    
    // Crear flecha derecha
    const flechaDer = document.createElement('button');
    flechaDer.id = 'flecha-der-modal';
    flechaDer.className = 'flecha-modal flecha-der';
    flechaDer.innerHTML = '▶';
    flechaDer.addEventListener('click', () => {
        indiceActual = (indiceActual + 1) % imagenes.length;
        detalleImg.src = imagenes[indiceActual];
    });
    
    // Asegurar que el contenedor tenga posición relativa
    const contenedorImagen = detalleImg.parentElement;
    contenedorImagen.style.position = 'relative';
    
    // Agregar flechas al contenedor
    contenedorImagen.appendChild(flechaIzq);
    contenedorImagen.appendChild(flechaDer);
}

// Mostrar tarjetas de categorías - SIN CARRUSEL, IMÁGENES FIJAS
function mostrarCategorias() {
    categoriasContainer.innerHTML = "";
    const cats = data.categorias || [];
    
    // Mapeo de imágenes fijas por categoría
    const imagenesFijas = {
        "Gigantografias": "img/gigantostitch.jpg",
        "Carteleria": "img/cartel.jpg",
        "HomeDeco": "img/decoportada.jpg"
    };
    
    cats.forEach(cat => {
        const div = document.createElement("div");
        div.className = "categoria";
        
        // Agregar clases especiales para cada categoría
        const catIdLower = cat.id.toLowerCase();
        if (catIdLower === "gigantografias") {
            div.classList.add("categoria-gigantografias");
        } else if (catIdLower === "carteleria") {
            div.classList.add("categoria-carteleria");
        } else if (catIdLower === "homedeco") {
            div.classList.add("categoria-homedeco");
        }
        
        // Usar imagen fija
        const img = imagenesFijas[cat.id] || cat.imagen || "img/personalizado.jpg";
        
        const imgWrapper = document.createElement("div");
        imgWrapper.className = "imagen-wrapper";
        
        const imgElement = document.createElement("img");
        imgElement.src = img;
        imgElement.alt = cat.nombre || cat.id;
        imgElement.onerror = function() {
            this.onerror = null;
            this.src = 'img/personalizado.jpg';
        };
        
        const h3 = document.createElement("h3");
        h3.textContent = cat.nombre || cat.id;
        
        imgWrapper.appendChild(imgElement);
        div.appendChild(imgWrapper);
        div.appendChild(h3);
        
        div.addEventListener("click", () => mostrarProductosCategoria(cat.id));
        categoriasContainer.appendChild(div);
    });

    // Personalizado
    const personalizado = document.createElement("div");
    personalizado.className = "categoria categoria-personalizado";
    
    const imgWrapperPers = document.createElement("div");
    imgWrapperPers.className = "imagen-wrapper";
    
    const imgPers = document.createElement("img");
    imgPers.src = "img/personalizado.jpg";
    imgPers.alt = "Personalizado";
    
    const h3Pers = document.createElement("h3");
    h3Pers.textContent = "Quiero un diseño personalizado";
    
    imgWrapperPers.appendChild(imgPers);
    personalizado.appendChild(imgWrapperPers);
    personalizado.appendChild(h3Pers);
    
    personalizado.addEventListener("click", () => {
        const texto = encodeURIComponent("¡Hola! Quiero hacer mi propia gigantografía personalizada / diseño personalizado. ¿Podrían ayudarme?");
        window.open(`https://wa.me/${telefonoWhats}?text=${texto}`, "_blank");
    });
    categoriasContainer.appendChild(personalizado);
}

// Mostrar productos de una categoría
function mostrarProductosCategoria(categoriaId) {
    const cat = data.categorias.find(c => c.id === categoriaId);
    if (!cat) return;

    categoriasContainer.classList.add("oculto");
    productosContainer.classList.remove("oculto");
    productosContainer.innerHTML = "";

    const volver = document.createElement("div");
    volver.className = "producto volver-btn";
    volver.innerHTML = `<h3>Volver a categorías</h3>`;
    volver.addEventListener("click", () => {
        productosContainer.classList.add("oculto");
        categoriasContainer.classList.remove("oculto");
        mostrarCategorias();
    });
    productosContainer.appendChild(volver);

    const productos = cat.productos || [];
    productos.forEach(prod => {
        const div = document.createElement("div");
        div.className = "producto";
        const imgUrl = prod.imagen || "img/personalizado.jpg";
        const tieneStock = (stockMap[prod.id] || 0) > 0;
        const esProximamente = prod.proximamente === true;
        
        const precioTexto = esProximamente ? "" : precioBase(prod);
        
        let etiquetaEntregaHTML = "";
        if (prod.tiempo_entrega) {
            const esInmediata = prod.tiempo_entrega.toLowerCase().includes("inmediata");
            const claseEtiqueta = esInmediata ? "etiqueta-entrega etiqueta-inmediata" : "etiqueta-entrega etiqueta-demora";
            etiquetaEntregaHTML = `<div class="${claseEtiqueta}">${prod.tiempo_entrega}</div>`;
        }
        
        div.innerHTML = `
            <div class="imagen-container ${!tieneStock ? 'sin-stock' : ''} ${esProximamente ? 'proximamente' : ''}" data-producto-id="${prod.id}">
                <img src="${imgUrl}" alt="${prod.nombre}" onerror="this.onerror=null;this.src='img/personalizado.jpg'">
                ${etiquetaEntregaHTML}
                ${!tieneStock ? '<div class="sin-stock-badge">SIN STOCK</div>' : ''}
            </div>
            <h3>${esProximamente ? 'PRÓXIMAMENTE' : prod.nombre}</h3>
            <p>${prod.descripcion}</p>
            ${!esProximamente ? `<div class="producto-info"><strong>${precioTexto}</strong></div>` : ''}
            ${!esProximamente ? '<button class="btn-ver">Ver</button>' : ''}
        `;
        
        if (!esProximamente) {
            div.querySelector(".btn-ver").addEventListener("click", () => abrirModalProducto(cat.id, prod.id));
        }
        productosContainer.appendChild(div);
        
        // Iniciar carrusel si el producto lo tiene configurado
        if (carruselesProductos[prod.id]) {
            const imgContainer = div.querySelector(".imagen-container");
            setTimeout(() => {
                iniciarCarruselPortada(prod.id, imgContainer);
            }, 100);
        }
    });

    const pers = document.createElement("div");
    pers.className = "producto";
    pers.innerHTML = `
        <div class="imagen-container">
            <img src="img/personalizado.jpg" alt="Personalizado" onerror="this.onerror=null;this.src='img/personalizado.jpg'">
        </div>
        <h3>Quiero un diseño personalizado</h3>
        <p>Encargá tu diseño a medida</p>
        <button class="btn-ver">Contactar</button>
    `;
    pers.querySelector(".btn-ver").addEventListener("click", () => {
        const texto = encodeURIComponent(`¡Hola! Quiero un diseño personalizado en la categoría ${categoriaId}.`);
        window.open(`https://wa.me/${telefonoWhats}?text=${texto}`, "_blank");
    });
    productosContainer.appendChild(pers);
}

function precioBase(prod) {
    if (prod.precios && prod.precios.length > 0) {
        if (typeof prod.precios[0] === 'string') {
            return "Precio a consultar";
        }
        const preciosNumericos = prod.precios.filter(p => typeof p === 'number');
        if (preciosNumericos.length > 0) {
            const minPrecio = Math.min(...preciosNumericos);
            return `$${minPrecio.toLocaleString('es-AR')}`;
        }
        return "Precio a consultar";
    }
    
    if (typeof prod.precio === 'string') {
        if (prod.precio.toLowerCase().includes('consultar')) {
            return "Precio a consultar";
        }
        return prod.precio;
    }
    if (prod.precio && prod.precio > 0) {
        return `$${prod.precio.toLocaleString('es-AR')}`;
    }
    return "Precio a consultar";
}

// Abrir modal producto
function abrirModalProducto(categoriaId, productoId) {
    const cat = data.categorias.find(c => c.id === categoriaId);
    if (!cat) return;
    const prod = cat.productos.find(p => p.id === productoId);
    if (!prod) return;

    productoActual = { ...prod, categoria: categoriaId };
    seleccion = { 
        medida: null, 
        color: null, 
        material: null,
        terminacion: null,
        acabado: null,
        medidaPersonalizada: null,
        colorPersonalizado: null
    };

    personalizadoMedidaWrapper.style.display = "none";
    personalizadoColorWrapper.style.display = "none";
    confirmacionMedida.style.display = "none";
    confirmacionColor.style.display = "none";
    opcionesMedidas.style.display = "flex";
    opcionesColores.style.display = "flex";
    btnPersonalizarMedida.style.display = "block";
    btnPersonalizarColor.style.display = "block";
    inputCantidad.value = 1;

    detalleNombre.textContent = productoActual.nombre;
    detalleDescripcion.textContent = productoActual.descripcion || "";
    
    // Configurar navegación manual en lugar de carrusel automático
    configurarNavegacionManual(productoActual.id);

    medidaPersonalizadaInput.value = "";
    document.getElementById("color-personalizado").value = "";

    opcionesMedidas.innerHTML = "";
    if (productoActual.medidas && productoActual.medidas.length) {
        productoActual.medidas.forEach((m, idx) => {
            const btn = document.createElement("button");
            btn.className = "chip";
            btn.textContent = m;
            
            btn.addEventListener("click", () => {
                [...opcionesMedidas.children].forEach(x => x.classList.remove("selected"));
                btn.classList.add("selected");
                seleccion.medida = m;
                seleccion.medidaPersonalizada = null;
                
                if (productoActual.precios && productoActual.precios[idx] !== undefined) {
                    productoActual.precioSeleccionado = productoActual.precios[idx];
                }
                actualizarPrecio();
            });
            opcionesMedidas.appendChild(btn);
            if (idx === 0) { 
                btn.click(); 
            }
        });
    } else {
        opcionesMedidas.innerHTML = "<em>Único</em>";
        seleccion.medida = "Único";
        if (productoActual.precios && productoActual.precios[0] !== undefined) {
            productoActual.precioSeleccionado = productoActual.precios[0];
        }
        actualizarPrecio();
    }

    opcionesColores.innerHTML = "";
    if (productoActual.color && productoActual.color.length) {
        opcionColorWrapper.style.display = "block";
        productoActual.color.forEach((c, idx) => {
            const chip = document.createElement("button");
            chip.className = "chip";
            chip.textContent = c;
            chip.addEventListener("click", () => {
                [...opcionesColores.children].forEach(x => x.classList.remove("selected"));
                chip.classList.add("selected");
                seleccion.color = c;
                actualizarPrecio();
            });
            opcionesColores.appendChild(chip);
            if (idx === 0) chip.click();
        });
    } else {
        opcionColorWrapper.style.display = "none";
        seleccion.color = null;
    }

    opcionesMaterial.innerHTML = "";
    if (productoActual.material && productoActual.material.length) {
        opcionMaterialWrapper.style.display = "block";
        productoActual.material.forEach((m, idx) => {
            const chip = document.createElement("button");
            chip.className = "chip";
            chip.textContent = m;
            chip.addEventListener("click", () => {
                [...opcionesMaterial.children].forEach(x => x.classList.remove("selected"));
                chip.classList.add("selected");
                seleccion.material = m;
                actualizarPrecio();
            });
            opcionesMaterial.appendChild(chip);
            if (idx === 0) chip.click();
        });
    } else {
        opcionMaterialWrapper.style.display = "none";
        seleccion.material = null;
    }

    opcionesAcabado.innerHTML = "";
    if (productoActual.acabado && productoActual.acabado.length) {
        opcionAcabadoWrapper.style.display = "block";
        productoActual.acabado.forEach((acabado, idx) => {
            const chip = document.createElement("button");
            chip.className = "chip";
            chip.textContent = acabado;
            chip.addEventListener("click", () => {
                [...opcionesAcabado.children].forEach(x => x.classList.remove("selected"));
                chip.classList.add("selected");
                seleccion.acabado = acabado;
                actualizarPrecio();
            });
            opcionesAcabado.appendChild(chip);
            if (idx === 0) chip.click();
        });
    } else {
        opcionAcabadoWrapper.style.display = "none";
        seleccion.acabado = null;
    }

    opcionesTerminacion.innerHTML = "";
    
    if (productoActual.ploteadoOMaderaLisa && productoActual.ploteadoOMaderaLisa.length) {
        opcionTerminacionWrapper.style.display = "block";
        productoActual.ploteadoOMaderaLisa.forEach((term, idx) => {
            const chip = document.createElement("button");
            chip.className = "chip";
            chip.textContent = term;
            chip.addEventListener("click", () => {
                [...opcionesTerminacion.children].forEach(x => x.classList.remove("selected"));
                chip.classList.add("selected");
                seleccion.terminacion = term;
                actualizarPrecio();
            });
            opcionesTerminacion.appendChild(chip);
            if (idx === 0) chip.click();
        });
    } 
    else if (productoActual.ploteado === true) {
        opcionTerminacionWrapper.style.display = "block";
        opcionesTerminacion.innerHTML = "<em>Ploteado (incluido)</em>";
        seleccion.terminacion = "Ploteado";
    } 
    else {
        opcionTerminacionWrapper.style.display = "none";
        seleccion.terminacion = null;
    }

    actualizarPrecio();
    productoModal.classList.remove("oculto");
}

function inicializarEventListenersModal() {
  btnPersonalizarMedida.addEventListener("click", () => {
    personalizadoMedidaWrapper.style.display = "block";
    opcionesMedidas.style.display = "none";
    btnPersonalizarMedida.style.display = "none";
  });

  btnConfirmarMedida.addEventListener("click", () => {
    const valor = medidaPersonalizadaInput.value.trim();
    if (valor) {
      seleccion.medidaPersonalizada = valor;
      seleccion.medida = `Personalizado: ${valor}`;
      confirmacionMedida.style.display = "block";
      actualizarPrecio();
    }
  });

  btnPersonalizarColor.addEventListener("click", () => {
    personalizadoColorWrapper.style.display = "block";
    opcionesColores.style.display = "none";
    btnPersonalizarColor.style.display = "none";
  });

  btnConfirmarColor.addEventListener("click", () => {
    const valor = document.getElementById("color-personalizado").value.trim();
    if (valor) {
      seleccion.colorPersonalizado = valor;
      seleccion.color = `Personalizado: ${valor}`;
      confirmacionColor.style.display = "block";
      actualizarPrecio();
    }
  });

  btnRestar.addEventListener("click", () => {
    let current = parseInt(inputCantidad.value);
    if (current > 1) {
      inputCantidad.value = current - 1;
    }
  });

  btnSumar.addEventListener("click", () => {
    let current = parseInt(inputCantidad.value);
    if (current < 99) {
      inputCantidad.value = current + 1;
    }
  });

  inputCantidad.addEventListener("change", (e) => {
    let value = parseInt(e.target.value);
    if (value < 1) e.target.value = 1;
    if (value > 99) e.target.value = 99;
  });

  if (btnSobreNosotros.length > 0) {
    btnSobreNosotros.forEach(boton => {
      boton.addEventListener("click", () => {
        if (sobreNosotrosContainer.classList.contains("oculto")) {
          categoriasContainer.classList.add("oculto");
          productosContainer.classList.add("oculto");
          sobreNosotrosContainer.classList.remove("oculto");
          btnSobreNosotros.forEach(btn => btn.textContent = "Volver");
        } else {
          sobreNosotrosContainer.classList.add("oculto");
          categoriasContainer.classList.remove("oculto");
          mostrarCategorias();
          btnSobreNosotros.forEach(btn => btn.textContent = "Sobre Nosotros");
        }
      });
    });
  }

  if (btnVolverInicio) {
    btnVolverInicio.addEventListener("click", () => {
      sobreNosotrosContainer.classList.add("oculto");
      categoriasContainer.classList.remove("oculto");
      mostrarCategorias();
      btnSobreNosotros.forEach(btn => btn.textContent = "Sobre Nosotros");
    });
  }

  if (cerrarCarritoBtn) {
    cerrarCarritoBtn.addEventListener("click", () => {
      carritoModal.classList.add("oculto");
    });
  }
  if (cerrarCarritoBtn2) {
    cerrarCarritoBtn2.addEventListener("click", () => {
      carritoModal.classList.add("oculto");
    });
  }

  if (cerrarProducto) {
    cerrarProducto.addEventListener("click", () => {
      productoModal.classList.add("oculto");
    });
  }
}

function actualizarPrecio() {
    if (!productoActual) return;

    if (seleccion.medidaPersonalizada) {
        detallePrecio.innerHTML = `<strong>Precio a consultar</strong>`;
        return;
    }

    if (productoActual.precioSeleccionado !== undefined) {
        if (typeof productoActual.precioSeleccionado === 'string') {
            if (productoActual.precioSeleccionado.toLowerCase().includes('consultar')) {
                detallePrecio.innerHTML = `<strong>Precio a consultar</strong>`;
            } else {
                detallePrecio.innerHTML = `<strong>${productoActual.precioSeleccionado}</strong>`;
            }
        } else if (productoActual.precioSeleccionado > 0) {
            const precioFormateado = productoActual.precioSeleccionado.toLocaleString('es-AR');
            // AGREGAR EL SIGNO $ AQUÍ
            detallePrecio.innerHTML = `<strong>$${precioFormateado}</strong>`;
        } else {
            detallePrecio.innerHTML = `<strong>Precio a consultar</strong>`;
        }
        return;
    }

    if (typeof productoActual.precio === 'string') {
        if (productoActual.precio.toLowerCase().includes('consultar')) {
            detallePrecio.innerHTML = `<strong>Precio a consultar</strong>`;
        } else {
            detallePrecio.innerHTML = `<strong>${productoActual.precio}</strong>`;
        }
        return;
    }
    if (productoActual.precio && productoActual.precio > 0) {
        const precioFormateado = productoActual.precio.toLocaleString('es-AR');
        // AGREGAR EL SIGNO $ AQUÍ
        detallePrecio.innerHTML = `<strong>$${precioFormateado}</strong>`;
        return;
    }
    detallePrecio.innerHTML = `<strong>Precio a consultar</strong>`;
}

medidaPersonalizadaInput.addEventListener("input", (e) => {
    if (e.target.value.trim() !== "") {
        seleccion.medidaPersonalizada = e.target.value.trim();
        [...opcionesMedidas.children].forEach(x => x.classList.remove("selected"));
        seleccion.medida = `Personalizado: ${seleccion.medidaPersonalizada}`;
    } else {
        seleccion.medidaPersonalizada = null;
    }
    actualizarPrecio();
});

btnAgregarCarrito.addEventListener("click", () => {
    if (!productoActual) return;

    const precioUnitario = calcularPrecioUnitario();
    const cantidad = parseInt(inputCantidad.value) || 1;
    
    const item = {
        uid: `${productoActual.id}-${Date.now()}`,
        id: productoActual.id,
        nombre: productoActual.nombre,
        cantidad: cantidad,
        medida: seleccion.medida || "Único",
        color: seleccion.color || "N/A",
        material: seleccion.material || "N/A",
        terminacion: seleccion.terminacion || "N/A",
        acabado: seleccion.acabado || "N/A",
        medidaPersonalizada: seleccion.medidaPersonalizada || null,
        colorPersonalizado: seleccion.colorPersonalizado || null,
        precioUnitario: precioUnitario
    };

    carrito.push(item);
    productoModal.classList.add("oculto");
    mostrarNotificacion(`${item.nombre} agregado al carrito`, "success");
    mostrarCarrito();
});

function calcularPrecioUnitario() {
    if (!productoActual) return 0;
    
    if (seleccion.medidaPersonalizada) return 0;
    
    if (productoActual.precioSeleccionado !== undefined) {
        if (typeof productoActual.precioSeleccionado === 'string') return 0;
        return productoActual.precioSeleccionado || 0;
    }
    
    if (typeof productoActual.precio === 'string') return 0;
    return productoActual.precio || 0;
}

btnCancelar.addEventListener("click", () => {
    productoModal.classList.add("oculto");
});

if (cerrarProducto) {
  cerrarProducto.addEventListener("click", () => {
      productoModal.classList.add("oculto");
  });
}

productoModal.addEventListener("click", e => { 
    if (e.target === productoModal) {
        productoModal.classList.add("oculto");
    }
});

function mostrarNotificacion(mensaje, tipo = "success") {
    const notification = document.createElement("div");
    notification.style.cssText = `
        position: fixed; bottom: 100px; right: 20px; padding: 15px 20px;
        border-radius: 8px; color:white; z-index:10000; font-weight:700;
        background: ${tipo === "success" ? "linear-gradient(135deg,#4CAF50,#45a049)" : "linear-gradient(135deg,#f44336,#d32f2f)"};
    `;
    notification.textContent = mensaje;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2400);
}

btnVerCarrito.addEventListener("click", () => {
    carritoModal.classList.remove("oculto");
    mostrarCarrito();
});

function mostrarCarrito() {
    listaCarrito.innerHTML = "";
    let suma = 0;

    if (!carrito.length) {
        const li = document.createElement("li");
        li.textContent = "Tu carrito está vacío";
        li.style.textAlign = "center";
        li.style.padding = "20px";
        listaCarrito.appendChild(li);
        
        // Esto ya está bien, muestra $0
        total.innerHTML = `Total: <strong>$0</strong>`;
    } else {
        carrito.forEach((it, idx) => {
            const esConsultar = it.medidaPersonalizada || it.precioUnitario === 0;
            const precio = esConsultar ? 0 : it.precioUnitario * it.cantidad;
            suma += precio;

            const li = document.createElement("li");
            
            const precioTexto = esConsultar ? 'Precio a consultar' : `$${(it.precioUnitario * it.cantidad).toLocaleString('es-AR')}`;
            
            li.innerHTML = `
                <div class="item-carrito">
                    <div style="flex:1;">
                        <strong>${it.nombre}</strong><br/>
                        <small>
                            Medida: ${it.medida}${it.medidaPersonalizada ? ` (Personalizado: ${it.medidaPersonalizada})` : ''}<br/>
                            ${it.color !== "N/A" ? `Color: ${it.color}${it.colorPersonalizado ? ` (Personalizado: ${it.colorPersonalizado})` : ''} • ` : ''}
                            ${it.material !== "N/A" ? `Material: ${it.material} • ` : ''}
                            ${it.acabado !== "N/A" ? `Acabado: ${it.acabado} • ` : ''}
                            ${it.terminacion !== "N/A" ? `Terminación: ${it.terminacion}` : ''}
                            ${it.cantidad > 1 ? ` • Cantidad: ${it.cantidad}` : ''}
                            ${it.personalizacionTexto ? `<br/><em style="color: var(--azul-principal);">Con personalización</em>` : ''}
                            ${it.quiereDisenoPersonalizado ? `<br/><em style="color: var(--rojo-colorcopy);">Incluye diseño personalizado</em>` : ''}
                        </small>
                    </div>
                    <div style="text-align:right;">
                        <div><strong>${precioTexto}</strong></div>
                        <div style="margin-top:8px; display: flex; gap: 5px;">
                            <button class="btn-personalizar-carrito" data-idx="${idx}">Personalizar</button>
                            <button class="btn-eliminar" data-idx="${idx}">Eliminar</button>
                        </div>
                    </div>
                </div>
            `;
            listaCarrito.appendChild(li);
        });

        // AGREGAR EL SIGNO $ AL TOTAL
        total.textContent = `Total: $${suma.toLocaleString('es-AR')}`;

        listaCarrito.querySelectorAll(".btn-eliminar").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = Number(btn.dataset.idx);
                carrito.splice(idx, 1);
                mostrarCarrito();
            });
        });
        listaCarrito.querySelectorAll(".btn-personalizar-carrito").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const idx = Number(btn.dataset.idx);
                abrirPersonalizacionItem(idx);
            });
        });
    }
}

document.querySelectorAll('input[name="entrega"]').forEach(r => {
    r.addEventListener("change", (e) => {
        if (e.target.value === "envio") {
            direccionWrapper.style.display = "block";
            if (!document.querySelector('.mensaje-consulta-envio')) {
                const mensajeEnvio = document.createElement('p');
                mensajeEnvio.className = 'mensaje-consulta-envio';
                mensajeEnvio.textContent = 'Consultar opciones de envío';
                direccionWrapper.appendChild(mensajeEnvio);
            }
        } else {
            direccionWrapper.style.display = "none";
        }
    });
});

function inicializarEventosCarrito() {
    if (cerrarCarritoBtn) {
        cerrarCarritoBtn.addEventListener("click", () => carritoModal.classList.add("oculto"));
    }
    if (cerrarCarritoBtn2) {
        cerrarCarritoBtn2.addEventListener("click", () => carritoModal.classList.add("oculto"));
    }
    
    if (btnFinalizarCompra) {
        btnFinalizarCompra.addEventListener("click", finalizarCompra);
    }
    
    carritoModal.addEventListener("click", e => { 
        if (e.target === carritoModal) carritoModal.classList.add("oculto"); 
    });
}

function finalizarCompra() {
    if (!carrito.length) {
        mostrarNotificacion("Tu carrito está vacío.", "error");
        return;
    }

    const nombreCliente = clienteNombreInput.value.trim() || "No informado";
    const entrega = document.querySelector('input[name="entrega"]:checked').value;
    const direccion = clienteDireccion.value.trim();
    const provincia = provinciaSelect ? provinciaSelect.value : "Córdoba";
    
    const medioPago = document.querySelector('input[name="medio-pago"]:checked').value;
    let medioPagoTexto = "";
    
    switch(medioPago) {
        case "efectivo":
            medioPagoTexto = "Efectivo";
            break;
        case "transferencia":
            medioPagoTexto = "Transferencia";
            break;
        case "debito":
            medioPagoTexto = "Débito / Mercado Pago";
            break;
        case "credito":
            const bancoSeleccionado = document.querySelector('input[name="banco"]:checked');
            medioPagoTexto = `Crédito${bancoSeleccionado ? ` (${bancoSeleccionado.value})` : ""} - Consultar cuotas disponibles`;
            break;
    }

    let itemsTexto = carrito.map(it => {
        let linea = `*${it.nombre}* - Cant: ${it.cantidad} - Medida: ${it.medida}`;
        if (it.medidaPersonalizada) linea += ` (Personalizado: ${it.medidaPersonalizada})`;
        linea += ` - Color: ${it.color}`;
        if (it.colorPersonalizado) linea += ` (Personalizado: ${it.colorPersonalizado})`;
        linea += ` - Material: ${it.material}`;
        if (it.acabado !== "N/A") linea += ` - Acabado: ${it.acabado}`;
        if (it.terminacion !== "N/A") linea += ` - Terminación: ${it.terminacion}`;
        
        if (it.personalizacionTexto) {
            linea += ` - Personalización: ${it.personalizacionTexto}`;
        }
        if (it.quiereDisenoPersonalizado) {
            linea += ` - Incluye diseño personalizado`;
        }
        
        const precioItem = (it.medidaPersonalizada || it.precioUnitario === 0) 
            ? "Precio a consultar" 
            : `${(it.precioUnitario * it.cantidad).toLocaleString('es-AR')}`;
        
        linea += ` - Precio: ${precioItem}`;
        return linea;
    }).join("\n\n");

    const totalCompra = carrito.reduce((acc, it) => 
        acc + (it.medidaPersonalizada || it.precioUnitario === 0 ? 0 : it.precioUnitario * it.cantidad), 0
    );

    let entregaTexto = "";
    if (entrega === "envio") {
        entregaTexto = `Envío a: ${direccion || "Dirección no informada"}, ${provincia}`;
    } else {
        entregaTexto = `Retira por local (Dr. Raúl Alfonsín 151, Alta Gracia, Córdoba)`;
    }

    const mensaje = 
        `Hola *Colorcopy*!\n\n` +
        `Quiero realizar el siguiente pedido:\n\n` +
        `${itemsTexto}\n\n` +
        `*Total estimado*: ${totalCompra.toLocaleString('es-AR')}\n\n` +
        `*Nombre*: ${nombreCliente}\n` +
        `*Medio de Pago*: ${medioPagoTexto}\n` +
        `*Entrega*: ${entregaTexto}\n\n` +
        `Comentarios adicionales:`;

    const textoFinal = encodeURIComponent(mensaje);
    window.open(`https://wa.me/${telefonoWhats}?text=${textoFinal}`, "_blank");
}

btnFinalizarCompra.addEventListener("click", finalizarCompra);

function abrirPersonalizacionItem(idx) {
    itemPersonalizandoIndex = idx;
    const item = carrito[idx];
    
    textoPersonalizacion.value = item.personalizacionTexto || "";
    checkboxDisenoPersonalizado.checked = item.quiereDisenoPersonalizado || false;
    
    modalPersonalizacionItem.classList.remove("oculto");
}

btnGuardarPersonalizacion.addEventListener("click", () => {
    if (itemPersonalizandoIndex === null) return;
    
    const texto = textoPersonalizacion.value.trim();
    const quiereDiseno = checkboxDisenoPersonalizado.checked;
    
    carrito[itemPersonalizandoIndex].personalizacionTexto = texto;
    carrito[itemPersonalizandoIndex].quiereDisenoPersonalizado = quiereDiseno;
    
    modalPersonalizacionItem.classList.add("oculto");
    mostrarNotificacion("Personalización guardada", "success");
    mostrarCarrito();
});

btnCancelarPersonalizacion.addEventListener("click", () => {
    modalPersonalizacionItem.classList.add("oculto");
});

modalPersonalizacionItem.addEventListener("click", (e) => {
    if (e.target === modalPersonalizacionItem) {
        modalPersonalizacionItem.classList.add("oculto");
    }
});

function inicializarMedioPago() {
    const infoTransferencia = document.getElementById("info-transferencia");
    const bancosCreditoWrapper = document.getElementById("bancos-credito-wrapper");
    
    if (!bancosCreditoWrapper) {
        console.error("No se encontró el elemento bancos-credito-wrapper");
        return;
    }
    
    function manejarCambioMedioPago() {
        const medioPagoSeleccionado = document.querySelector('input[name="medio-pago"]:checked');
        
        if (!medioPagoSeleccionado) return;
        
        if (infoTransferencia) {
            infoTransferencia.style.display = "none";
        }
        bancosCreditoWrapper.style.display = "none";
        
        if (medioPagoSeleccionado.value === "transferencia" && infoTransferencia) {
            infoTransferencia.style.display = "block";
        } else if (medioPagoSeleccionado.value === "credito") {
            bancosCreditoWrapper.style.display = "block";
        }
    }
    
    document.querySelectorAll('input[name="medio-pago"]').forEach(radio => {
        radio.addEventListener("change", manejarCambioMedioPago);
    });
    
    manejarCambioMedioPago();
}

const videoPlayer = document.getElementById("videoPlayer");
const prevVideoBtn = document.getElementById("prevVideo");
const nextVideoBtn = document.getElementById("nextVideo");

const videos = [
  "videos/video1.mp4",
  "videos/video2.mp4", 
  "videos/video3.mp4",
  "videos/video4.mp4",
  "videos/video5.mp4"
].filter(src => src);

let currentVideo = 0;
let autoPlayTimeout;

function cargarVideo(index) {
  if (!videoPlayer || videos.length === 0) return;
  
  if (autoPlayTimeout) {
    clearTimeout(autoPlayTimeout);
  }
  
  if (index < 0) index = videos.length - 1;
  if (index >= videos.length) index = 0;
  
  currentVideo = index;
  videoPlayer.src = videos[currentVideo];
  
  videoPlayer.setAttribute('playsinline', '');
  videoPlayer.setAttribute('webkit-playsinline', '');
  
  videoPlayer.load();
  
  videoPlayer.muted = true;
  videoPlayer.volume = 0;
  
  const counter = document.querySelector('.video-counter');
  if (counter) {
    counter.textContent = `${currentVideo + 1} / ${videos.length}`;
  }
  
  const progressBar = document.querySelector('.video-progress-bar');
  if (progressBar) {
    progressBar.style.width = '0%';
  }
  
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 1;
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    if (progress >= 100) {
      clearInterval(progressInterval);
    }
  }, 50);
  
  videoPlayer.play().catch(() => {
    console.log("Autoplay bloqueado, el usuario debe iniciar manualmente");
  });
  
  autoPlayTimeout = setTimeout(() => {
    clearInterval(progressInterval);
    cargarVideo(currentVideo + 1);
  }, 5000);
}

videoPlayer.addEventListener('ended', () => {
  cargarVideo(currentVideo + 1);
});

function inicializarCarruselVideos() {
  if (videoPlayer && videos.length > 0) {
    cargarVideo(0);

    if (prevVideoBtn) {
      prevVideoBtn.addEventListener("click", () => {
        cargarVideo(currentVideo - 1);
      });
    }

    if (nextVideoBtn) {
      nextVideoBtn.addEventListener("click", () => {
        cargarVideo(currentVideo + 1);
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
    cargarStock();
    inicializarEventListenersModal();
    inicializarMedioPago();
    inicializarEventosCarrito();
    inicializarCarruselVideos();
});