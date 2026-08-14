import LoginCliente from "./pages/LoginCliente";
import RegisterCliente from "./pages/RegisterCliente";
import { useState, useEffect, useRef } from "react";
import "./App.css";
import productos from "./data/productos";
import { Routes, Route, useNavigate } from "react-router-dom";
import PagoExitoso from "./PagoExitoso";
import PagoFallido from "./PagoFallido";
import PagoPendiente from "./PagoPendiente";
import AdminPanel from "./pages/AdminPanel";
import LoginAdmin from "./pages/LoginAdmin";
import Perfil from "./pages/Perfil";
import DetalleProducto from "./pages/DetalleProducto";
import ResetPassword from "./pages/ResetPassword";
import Catalogo from "./pages/Catalogo";

function App() {
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem("carrito");
    return guardado ? JSON.parse(guardado) : [];
  });
  const [clienteLogueado, setClienteLogueado] = useState(() => localStorage.getItem("clienteToken"));
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [animarCarrito, setAnimarCarrito] = useState(false);
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [marcaSeleccionada, setMarcaSeleccionada] = useState("");
  const [listaProductos, setListaProductos] = useState({});
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [productosMenuAbierto, setProductosMenuAbierto] = useState(false);
  const [usuarioMenuAbierto, setUsuarioMenuAbierto] = useState(false);
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [contactoNombre, setContactoNombre] = useState("");
  const [contactoEmail, setContactoEmail] = useState("");
  const [contactoMensaje, setContactoMensaje] = useState("");
  const [contactoEnviado, setContactoEnviado] = useState(false);
  const [contactoCargando, setContactoCargando] = useState(false);

  const productosMenuTimer = useRef(null);
  const usuarioMenuTimer = useRef(null);

  useEffect(() => { localStorage.setItem("carrito", JSON.stringify(carrito)); }, [carrito]);

  // Limpiar carrito cuando PagoExitoso borra el localStorage (desde otra pestaña/página)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "carrito" && e.newValue === null) {
        setCarrito([]);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
  useEffect(() => {
    fetch("https://funtechstore-production.up.railway.app/productos")
      .then(r => r.json())
      .then(data => setListaProductos(data))
      .catch(console.error);
  }, []);

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(p => p.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(p => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
    setAnimarCarrito(true);
    setTimeout(() => setAnimarCarrito(false), 300);
  };

  const eliminarDelCarrito = (id) => setCarrito(prev => prev.filter(item => item.id !== id));
  const aumentarCantidad = (id) => setCarrito(prev => prev.map(item => item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item));
  const disminuirCantidad = (id) => setCarrito(prev => prev.map(item => item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item).filter(item => item.cantidad > 0));
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const cerrarSesion = () => {
    localStorage.removeItem("clienteToken");
    localStorage.removeItem("clienteEmail");
    localStorage.removeItem("clienteNombre");
    setClienteLogueado(null);
    setUsuarioMenuAbierto(false);
  };

  // Handlers con delay para que el dropdown no se cierre al mover el mouse
  const handleProductosEnter = () => {
    clearTimeout(productosMenuTimer.current);
    setProductosMenuAbierto(true);
  };
  const handleProductosLeave = () => {
    productosMenuTimer.current = setTimeout(() => setProductosMenuAbierto(false), 150);
  };

  const handleUsuarioEnter = () => {
    clearTimeout(usuarioMenuTimer.current);
    setUsuarioMenuAbierto(true);
  };
  const handleUsuarioLeave = () => {
    usuarioMenuTimer.current = setTimeout(() => setUsuarioMenuAbierto(false), 150);
  };

  const clienteNombre = localStorage.getItem("clienteNombre");

  const IconSearch = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
  const IconCart = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>;
  const IconUser = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
  const IconChevron = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>;
  const IconMenu = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
  const IconClose = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
  const IconTrash = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>;
  const IconArrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
  const IconLogout = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;

  return (
    <Routes>
      <Route path="/" element={
        <div className="app">

          {/* NAVBAR */}
          <header className="navbar">
            <div className="navbar-left">
              <button className="hamburguesa" onClick={() => setMenuAbierto(!menuAbierto)}>
                {menuAbierto ? <IconClose /> : <IconMenu />}
              </button>
              <a href="/" className="navbar-logo">
                <img src="/logo.png" alt="Funtek" className="logo" />
              </a>
            </div>

            <nav className="navbar-center">
              <a href="#inicio" className="nav-link">Inicio</a>

              {/* Dropdown Productos */}
              <div
                className="nav-dropdown-wrapper"
                onMouseEnter={handleProductosEnter}
                onMouseLeave={handleProductosLeave}
              >
                <span className="nav-link nav-link-icon" onClick={() => navigate("/catalogo")} style={{ cursor: "pointer" }}>Productos <IconChevron /></span>
                {productosMenuAbierto && (
                  <div
                    className="dropdown-menu"
                    onMouseEnter={handleProductosEnter}
                    onMouseLeave={handleProductosLeave}
                  >
                    <div className="dropdown-section">
                      <p className="dropdown-label">Categorías</p>
                      {Object.keys(listaProductos).map((cat) => (
                        <a key={cat} href={`/catalogo?categoria=${cat}`} className="dropdown-item"
                          onClick={() => setProductosMenuAbierto(false)}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </a>
                      ))}
                    </div>
                    {[...new Set(Object.values(listaProductos).flat().map(p => p.marca).filter(Boolean))].length > 0 && (
                      <div className="dropdown-section">
                        <p className="dropdown-label">Marcas</p>
                        {[...new Set(Object.values(listaProductos).flat().map(p => p.marca).filter(Boolean))].map((marca, i) => (
                          <a key={i} href="/catalogo" className="dropdown-item"
                            onClick={() => { setMarcaSeleccionada(marca); setProductosMenuAbierto(false); }}>
                            {marca}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <a href="#como-comprar" className="nav-link">Cómo Comprar</a>
              <a href="#contacto" className="nav-link">Contacto</a>
            </nav>

            <div className="navbar-right">
              <div className="buscador">
                <span className="buscador-icon"><IconSearch /></span>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="buscador-input"
                />
                {busqueda && <button className="buscador-clear" onClick={() => setBusqueda("")}><IconClose /></button>}
              </div>

              {/* Botón usuario con dropdown */}
              {!clienteLogueado ? (
                <a href="/login" className="nav-icon-btn" title="Iniciar sesión"><IconUser /></a>
              ) : (
                <div
                  className="nav-dropdown-wrapper"
                  onMouseEnter={handleUsuarioEnter}
                  onMouseLeave={handleUsuarioLeave}
                >
                  <button className="nav-icon-btn nav-icon-btn-active" title="Mi cuenta">
                    <IconUser />
                  </button>
                  {usuarioMenuAbierto && (
                    <div
                      className="dropdown-menu dropdown-menu-right"
                      onMouseEnter={handleUsuarioEnter}
                      onMouseLeave={handleUsuarioLeave}
                    >
                      <div className="dropdown-usuario-header">
                        <p className="dropdown-usuario-nombre">Hola, {clienteNombre || "Cliente"}</p>
                      </div>
                      <div className="dropdown-section">
                        <a href="/perfil" className="dropdown-item" onClick={() => setUsuarioMenuAbierto(false)}>
                          <IconUser /> Ver perfil
                        </a>
                        <button className="dropdown-item dropdown-item-logout" onClick={cerrarSesion}>
                          <IconLogout /> Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button className={`carrito-btn ${animarCarrito ? "carrito-animado" : ""}`} onClick={() => setCarritoAbierto(true)}>
                <IconCart />
                {carrito.length > 0 && <span className="badge">{carrito.reduce((acc, item) => acc + item.cantidad, 0)}</span>}
              </button>
            </div>
          </header>

          {/* MENÚ MOBILE */}
          {menuAbierto && (
            <div className="nav-mobile">
              <a href="#inicio" onClick={() => setMenuAbierto(false)}>Inicio</a>
              <a href="/catalogo" onClick={() => setMenuAbierto(false)}>Productos</a>
              {Object.keys(listaProductos).map((cat) => (
                <a key={cat} href={`/catalogo?categoria=${cat}`} className="nav-mobile-sub"
                  onClick={() => { setCategoriaSeleccionada(cat); setMenuAbierto(false); }}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </a>
              ))}
              <a href="#como-comprar" onClick={() => setMenuAbierto(false)}>Cómo Comprar</a>
              <a href="#contacto" onClick={() => setMenuAbierto(false)}>Contacto</a>
              <div className="nav-mobile-divider" />
              {!clienteLogueado ? (
                <>
                  <a href="/login" onClick={() => setMenuAbierto(false)}>Iniciar sesión</a>
                  <a href="/register" onClick={() => setMenuAbierto(false)}>Registrarse</a>
                </>
              ) : (
                <>
                  <a href="/perfil" onClick={() => setMenuAbierto(false)}>Mi perfil</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); cerrarSesion(); setMenuAbierto(false); }}>Cerrar sesión</a>
                </>
              )}
            </div>
          )}

          {/* CARRITO LATERAL */}
          {carritoAbierto && (
            <div className="overlay" onClick={() => setCarritoAbierto(false)}>
              <div className="carrito-lateral" onClick={(e) => e.stopPropagation()}>
                <div className="carrito-header">
                  <h2>Tu carrito</h2>
                  <button onClick={() => setCarritoAbierto(false)}><IconClose /></button>
                </div>
                {carrito.length === 0 && (
                  <div className="carrito-vacio">
                    <IconCart />
                    <p>Tu carrito está vacío</p>
                  </div>
                )}
                {carrito.map((item) => (
                  <div key={item.id} className="carrito-item">
                    <div className="carrito-item-img">
                      <img src={item.imagen} alt={item.nombre} />
                    </div>
                    <div className="carrito-item-info">
                      <p className="carrito-item-nombre">{item.nombre}</p>
                      <p className="carrito-item-precio">${item.precio * item.cantidad}</p>
                    </div>
                    <div className="cantidad-controls">
                      <button onClick={() => disminuirCantidad(item.id)}>−</button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => aumentarCantidad(item.id)}>+</button>
                    </div>
                    <button className="btn-eliminar" onClick={() => eliminarDelCarrito(item.id)}><IconTrash /></button>
                  </div>
                ))}
                {carrito.length > 0 && (
                  <div className="carrito-footer">
                    <div className="carrito-total-row">
                      <span>Total</span>
                      <span className="carrito-total-monto">${total}</span>
                    </div>
                    <button className="btn-checkout" onClick={() => {
                      const nombre = clienteLogueado ? localStorage.getItem("clienteNombre") : "";
                      const resumen = carrito.map(i => `• ${i.nombre}${i.variantesElegidas && Object.keys(i.variantesElegidas).length > 0 ? " (" + Object.entries(i.variantesElegidas).map(([k,v]) => `${k}: ${v}`).join(", ") + ")" : ""} x${i.cantidad} — $${(i.precio * i.cantidad).toLocaleString("es-AR")}`).join("\n");
                      const msg = encodeURIComponent(`Hola FunTech! Quiero hacer un pedido 🛒\n\n${resumen}\n\nTotal: $${total.toLocaleString("es-AR")}${nombre ? `\n\nNombre: ${nombre}` : ""}`);
                      setCarritoAbierto(false);
                      window.open(`https://wa.me/5493412682820?text=${msg}`, "_blank");
                    }}>
                      Finalizar compra
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HERO */}
          <section id="inicio" className="hero">
            <div className="hero-text">
              <span className="hero-badge">Nuevo · 2026</span>
              <h1>Tecnología que marca<br />la <span className="hero-highlight">diferencia</span></h1>
              <p>Accesorios premium para tu celular y dispositivos. Calidad, diseño y potencia en un solo lugar.</p>
              <div className="hero-btns">
                <button className="hero-btn" onClick={() => navigate("/catalogo")}>
                  Ver productos <IconArrow />
                </button>
                <a href="#como-comprar" className="hero-btn-outline">Cómo comprar</a>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-image-wrapper">
                <img src="https://res.cloudinary.com/funtek/image/upload/8fbb1af110be2df1ecee1203ca2028c5_ckzddf.jpg" alt="Accesorios tech" />
              </div>
            </div>
          </section>

          {/* CATEGORÍAS */}
          <section className="categorias">
            <div className="categorias-header">
              <h2>Explorá por categoría</h2>
              <button className="categorias-ver-todo" onClick={() => navigate("/catalogo")}>
                Ver todo <IconArrow />
              </button>
            </div>
            <div className="categorias-grid">
              {Object.keys(listaProductos).map((cat) => {
                const imagenesCat = {
                  fundas: "https://res.cloudinary.com/funtek/image/upload/fundas_gkjqnr.png",
                  cargadores: "https://res.cloudinary.com/funtek/image/upload/cargadores_d4zq27.png",
                  auriculares: "https://res.cloudinary.com/funtek/image/upload/auriculares_tnviux.png",
                  cables: "https://res.cloudinary.com/funtek/image/upload/cables_noqluy.png",
                  "micrófonos": "https://res.cloudinary.com/funtek/image/upload/microfonos_vp5fdy.png",
                  protectores: "https://res.cloudinary.com/funtek/image/upload/protectores_qe5qcm.png",
                  parlantes: "https://res.cloudinary.com/funtek/image/upload/parlantes_aseife.png",
                };
                const imgSrc = imagenesCat[cat.toLowerCase()] || listaProductos[cat][0]?.imagen;
                return (
                  <div key={cat} className="categoria-card"
                    onClick={() => navigate(`/catalogo?categoria=${cat}`)}>
                    <div className="categoria-img">
                      {imgSrc ? <img src={imgSrc} alt={cat} /> : <div className="categoria-placeholder" />}
                    </div>
                    <div className="categoria-info">
                      <span className="categoria-nombre">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                      <span className="categoria-count">{listaProductos[cat].length} productos</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* BANNER */}
          <div style={{ padding: "0 40px", marginBottom: "20px" }}>
            <img
              src="https://res.cloudinary.com/funtek/image/upload/bannerfuntek_dgvvey.webp"
              alt="Banner Funtek"
              style={{ width: "65%", borderRadius: "20px", display: "block", cursor: "pointer", margin: "0 auto" }}
              onClick={() => navigate("/catalogo")}
            />
          </div>

          {/* PRODUCTOS */}
          <section id="productos">
            {Object.entries(listaProductos)
              .filter(([cat]) => !categoriaSeleccionada || cat === categoriaSeleccionada)
              .map(([cat, items]) => {
                const filtrados = items.filter((p) => {
                  return p.nombre.toLowerCase().includes(busqueda.toLowerCase())
                    && (precioMin === "" || p.precio >= parseInt(precioMin))
                    && (precioMax === "" || p.precio <= parseInt(precioMax))
                    && (marcaSeleccionada === "" || p.marca === marcaSeleccionada);
                });
                if (filtrados.length === 0) return null;
                return (
                  <div key={cat}>
                    <h2 id={cat} className="seccion-titulo">{cat.charAt(0).toUpperCase() + cat.slice(1)}</h2>
                    <div className="productos-grid">
                      {filtrados.map((producto) => (
                        <div className="card" key={producto.id} onClick={() => navigate(`/producto/${producto.id}`)} style={{ cursor: "pointer" }}>
                          <div className="imagen-container">
                            <img src={producto.imagen} alt={producto.nombre} />
                          </div>
                          <div className="card-info">
                            <span className="card-marca">{producto.marca || "\u00a0"}</span>
                            <h3>{producto.nombre}</h3>
                            <div className="card-footer">
                              <p className="card-precio">${producto.precio}</p>
                              <button className="card-btn" onClick={(e) => { e.stopPropagation(); agregarAlCarrito(producto); }}>
                                + Agregar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            {busqueda && Object.values(listaProductos).flat().filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase())).length === 0 && (
              <div className="sin-resultados">
                <div className="sin-resultados-emoji">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <p>No encontramos productos para <strong>"{busqueda}"</strong></p>
                <button onClick={() => setBusqueda("")}>Ver todos</button>
              </div>
            )}
          </section>

          {/* CÓMO COMPRAR */}
          <section id="como-comprar" className="info-section">
            <h2 className="info-titulo">¿Cómo comprar?</h2>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /></svg>
                </div>
                <h3>Elegí tus productos</h3>
                <p>Navegá por el catálogo y agregá lo que te guste al carrito.</p>
              </div>
              <div className="info-card">
                <div className="info-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                </div>
                <h3>Contactanos por WhatsApp</h3>
                <p>Al finalizar la compra te mandamos directo a WhatsApp para coordinar el pago y el envío.</p>
              </div>
              <div className="info-card">
                <div className="info-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                </div>
                <h3>Recibí en casa</h3>
                <p>Enviamos a todo el país. Coordinamos el envío y el pago por WhatsApp.</p>
              </div>
            </div>
          </section>

          {/* CONTACTO */}
          <section id="contacto" style={{
            background: "#f5f5f5",
            padding: "80px 40px"
          }}>
            <div style={{ maxWidth: "700px", margin: "0 auto" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: "400", marginBottom: "8px" }}>
                Contacto
              </h2>
              <p style={{ color: "#888", fontSize: "15px", marginBottom: "36px" }}>
                Escribinos y te respondemos a la brevedad.
              </p>

              {contactoEnviado ? (
                <div style={{ background: "#ffd000", borderRadius: "14px", padding: "24px", fontWeight: "700", fontSize: "15px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  ¡Mensaje enviado! Te respondemos a la brevedad.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={contactoNombre}
                    onChange={(e) => setContactoNombre(e.target.value)}
                    style={{ padding: "13px 16px", borderRadius: "10px", border: "1.5px solid #e0e0e0", fontSize: "14px", outline: "none", fontFamily: "var(--font-body)" }}
                  />
                  <input
                    type="email"
                    placeholder="Tu email"
                    value={contactoEmail}
                    onChange={(e) => setContactoEmail(e.target.value)}
                    style={{ padding: "13px 16px", borderRadius: "10px", border: "1.5px solid #e0e0e0", fontSize: "14px", outline: "none", fontFamily: "var(--font-body)" }}
                  />
                  <textarea
                    placeholder="Tu mensaje..."
                    value={contactoMensaje}
                    onChange={(e) => setContactoMensaje(e.target.value)}
                    rows={5}
                    style={{ gridColumn: "1 / -1", padding: "13px 16px", borderRadius: "10px", border: "1.5px solid #e0e0e0", fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "var(--font-body)" }}
                  />
                  <button
                    onClick={async () => {
                      if (!contactoNombre || !contactoEmail || !contactoMensaje) {
                        alert("Completá todos los campos");
                        return;
                      }
                      setContactoCargando(true);
                      try {
                        const res = await fetch("http://localhost:3000/contacto", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ nombre: contactoNombre, email: contactoEmail, mensaje: contactoMensaje })
                        });
                        const data = await res.json();
                        if (data.ok) {
                          setContactoEnviado(true);
                          setContactoNombre("");
                          setContactoEmail("");
                          setContactoMensaje("");
                        } else {
                          alert("Error al enviar el mensaje");
                        }
                      } catch (error) {
                        alert("Error de conexión");
                      } finally {
                        setContactoCargando(false);
                      }
                    }}
                    style={{ gridColumn: "1 / -1", background: "#111", color: "white", border: "none", padding: "14px", borderRadius: "10px", fontWeight: "700", fontSize: "15px", cursor: "pointer", fontFamily: "var(--font-body)" }}
                  >
                    {contactoCargando ? "Enviando..." : "Enviar mensaje"}
                  </button>
                </div>
              )}

              <div style={{ marginTop: "36px", display: "flex", gap: "24px", flexWrap: "wrap" }}>
                <a href="https://instagram.com/funtekstore" target="_blank" rel="noreferrer"
                  style={{ color: "#555", fontSize: "14px", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4.5" />
                    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                  </svg>
                  @funtekstore
                </a>
                <a href="mailto:funtekstore@gmail.com"
                  style={{ color: "#555", fontSize: "14px", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <polyline points="2,4 12,13 22,4" />
                  </svg>
                  funtekstore@gmail.com
                </a>
                <a href="https://wa.me/5493412682820" target="_blank" rel="noreferrer"
                  style={{ color: "#555", fontSize: "14px", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="footer">
            <div className="footer-inner">
              <div className="footer-brand">
                <img src="/logo_footer.png" alt="Funtek" className="footer-logo" />
                <p>Accesorios tecnológicos de calidad para tu día a día.</p>
              </div>
              <div className="footer-links">
                <div className="footer-col">
                  <h4>Tienda</h4>
                  <a href="/catalogo">Productos</a>
                  <a href="#como-comprar">Cómo comprar</a>
                </div>
                <div className="footer-col">
                  <h4>Cuenta</h4>
                  <a href="/login">Iniciar sesión</a>
                  <a href="/register">Registrarse</a>
                  <a href="/perfil">Mi perfil</a>
                </div>
                <div className="footer-col">
                  <h4>Contacto</h4>
                  <a href="https://instagram.com/funtekstore" target="_blank" rel="noreferrer"
                    style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="4.5" />
                      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                    </svg>
                    Instagram
                  </a>
                  <a href="mailto:funtekstore@gmail.com"
                    style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <polyline points="2,4 12,13 22,4" />
                    </svg>
                    funtekstore@gmail.com
                  </a>
                  <a href="https://wa.me/5493412682820" target="_blank" rel="noreferrer"
                    style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>© 2026 Funtek · Todos los derechos reservados.</p>
            </div>
          </footer>

          {/* BOTÓN FLOTANTE WHATSAPP */}
          <a
            href="https://wa.me/5493412682820"
            target="_blank"
            rel="noreferrer"
            style={{
              position: "fixed", bottom: "28px", right: "28px", zIndex: 9998,
              width: "56px", height: "56px", borderRadius: "50%",
              background: "#25d366", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(37,211,102,0.45)",
              transition: "transform 0.2s, box-shadow 0.2s",
              textDecoration: "none"
            }}
            onMouseOver={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(37,211,102,0.55)"; }}
            onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,211,102,0.45)"; }}
            title="Escribinos por WhatsApp"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>

        </div>
      } />

      <Route path="/pago-exitoso" element={<PagoExitoso />} />
      <Route path="/pago-fallido" element={<PagoFallido />} />
      <Route path="/pago-pendiente" element={<PagoPendiente />} />
      <Route path="/login" element={<LoginCliente />} />
      <Route path="/register" element={<RegisterCliente />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/login-admin" element={<LoginAdmin />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/producto/:id" element={<DetalleProducto agregarAlCarrito={agregarAlCarrito} />} />
      <Route path="/catalogo" element={<Catalogo agregarAlCarrito={agregarAlCarrito} productosIniciales={listaProductos} />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}

export default App;
