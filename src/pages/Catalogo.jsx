import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Fuse from "fuse.js";

const IconFilter = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
  </svg>
);

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

const IconCart = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const IconGrid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);

const IconList = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

function Catalogo({ agregarAlCarrito, productosIniciales }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [listaProductos, setListaProductos] = useState(productosIniciales || {});

  useEffect(() => {
    // Si ya vienen productos desde App.jsx los usamos directamente
    if (productosIniciales && Object.keys(productosIniciales).length > 0) {
      setListaProductos(productosIniciales);
    } else {
      // Fallback: fetch propio si se accede directo a /catalogo sin pasar por home
      fetch("https://funtechstore-production.up.railway.app/productos")
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => { if (data && typeof data === "object") setListaProductos(data); })
        .catch(console.error);
    }
  }, [productosIniciales]);

  const categorias = Object.keys(listaProductos);
  const todosLosProductos = Object.entries(listaProductos).flatMap(([cat, items]) =>
    items.map(p => ({ ...p, categoria: cat }))
  );
  const marcas = [...new Set(todosLosProductos.map(p => p.marca).filter(Boolean))];

  const productoTieneStock = (p) => {
    const variantes = p.variantes || [];
    if (variantes.length === 0) return (p.stock ?? 0) > 0;
    return variantes.some(v => v.opciones.some(op => (op.stock ?? 0) > 0));
  };
  const precioMaxGlobal = Math.max(...todosLosProductos.map(p => p.precio));

  // Filtros
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState(() => {
    const cat = searchParams.get("categoria");
    return cat ? [cat] : [];
  });
  const [marcasSeleccionadas, setMarcasSeleccionadas] = useState([]);
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [ordenar, setOrdenar] = useState("default");
  const [busqueda, setBusqueda] = useState("");
  const [vistaLista, setVistaLista] = useState(false);
  const [filtrosMobileAbiertos, setFiltrosMobileAbiertos] = useState(false);
  const [agregadoId, setAgregadoId] = useState(null);

  const toggleCategoria = (cat) => {
    setCategoriasSeleccionadas(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleMarca = (marca) => {
    setMarcasSeleccionadas(prev =>
      prev.includes(marca) ? prev.filter(m => m !== marca) : [...prev, marca]
    );
  };

  const limpiarFiltros = () => {
    setCategoriasSeleccionadas([]);
    setMarcasSeleccionadas([]);
    setPrecioMin("");
    setPrecioMax("");
    setOrdenar("default");
    setBusqueda("");
  };

  const hayFiltrosActivos = categoriasSeleccionadas.length > 0 || marcasSeleccionadas.length > 0 || precioMin || precioMax || busqueda;

  const productosFiltrados = (() => {
    let resultado = todosLosProductos.filter(p => {
      if (categoriasSeleccionadas.length > 0 && !categoriasSeleccionadas.includes(p.categoria)) return false;
      if (marcasSeleccionadas.length > 0 && !marcasSeleccionadas.includes(p.marca)) return false;
      if (precioMin && p.precio < parseInt(precioMin)) return false;
      if (precioMax && p.precio > parseInt(precioMax)) return false;
      return true;
    });

    if (busqueda.trim()) {
      const fuse = new Fuse(resultado, {
        keys: [
          { name: "nombre", weight: 0.5 },
          { name: "marca", weight: 0.3 },
          { name: "descripcion", weight: 0.15 },
          { name: "categoria", weight: 0.05 },
        ],
        threshold: 0.4,
        includeScore: false,
        ignoreLocation: true,
      });
      resultado = fuse.search(busqueda).map(r => r.item);
    }

    return resultado.sort((a, b) => {
      if (ordenar === "precio_asc") return a.precio - b.precio;
      if (ordenar === "precio_desc") return b.precio - a.precio;
      if (ordenar === "nombre") return a.nombre.localeCompare(b.nombre);
      return 0;
    });
  })();

  const handleAgregar = (e, producto) => {
    e.stopPropagation();
    agregarAlCarrito(producto);
    setAgregadoId(producto.id);
    setTimeout(() => setAgregadoId(null), 1500);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>

      {/* Navbar */}
      <div style={{
        background: "white", borderBottom: "1px solid #f0f0f0",
        padding: "16px 32px", display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 12px rgba(0,0,0,0.04)"
      }}>
        <img src="/logo.png" alt="Funtek" style={{ height: "100px", cursor: "pointer" }} onClick={() => navigate("/")} />
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => navigate("/")}
            style={{
              background: "none", border: "1.5px solid #e8e8e8", cursor: "pointer",
              fontSize: "13px", color: "#666", padding: "8px 16px", borderRadius: "20px",
              display: "flex", alignItems: "center", gap: "7px", fontWeight: "600",
              fontFamily: "inherit", transition: "border-color 0.2s"
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = "#111"}
            onMouseOut={e => e.currentTarget.style.borderColor = "#e8e8e8"}
          >
            <IconArrowLeft /> Volver a la tienda
          </button>
          <button onClick={() => navigate(localStorage.getItem("clienteToken") ? "/perfil" : "/login")}
            style={{
              background: "none", border: "1.5px solid #e8e8e8", cursor: "pointer",
              padding: "8px 10px", borderRadius: "20px", display: "flex", alignItems: "center",
              gap: "6px", fontWeight: "600", fontSize: "13px", color: "#666",
              fontFamily: "inherit", transition: "border-color 0.2s"
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = "#111"}
            onMouseOut={e => e.currentTarget.style.borderColor = "#e8e8e8"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            {localStorage.getItem("clienteToken") ? (localStorage.getItem("clienteNombre") || "Mi perfil") : "Ingresar"}
          </button>
          <button onClick={() => navigate("/#carrito")}
            style={{
              background: "#111", border: "none", cursor: "pointer",
              padding: "8px 16px", borderRadius: "20px", display: "flex", alignItems: "center",
              gap: "7px", fontWeight: "700", fontSize: "13px", color: "#ffd000",
              fontFamily: "inherit", transition: "background 0.2s", position: "relative"
            }}
            onMouseOver={e => e.currentTarget.style.background = "#333"}
            onMouseOut={e => e.currentTarget.style.background = "#111"}
            title="Ver carrito en la tienda"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
            </svg>
            Carrito
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 20px", display: "flex", gap: "28px", alignItems: "flex-start" }}>

        {/* SIDEBAR FILTROS — desktop */}
        <aside style={{
          width: "240px", minWidth: "240px", flexShrink: 0, background: "white",
          borderRadius: "20px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          position: "sticky", top: "88px", boxSizing: "border-box"
        }} className="filtros-sidebar-desktop">

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <span style={{ fontWeight: "700", fontSize: "15px", color: "#111" }}>Filtros</span>
            {hayFiltrosActivos && (
              <button onClick={limpiarFiltros} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "12px", color: "#aaa", fontWeight: "600", fontFamily: "inherit"
              }}>Limpiar</button>
            )}
          </div>

          {/* Categorías */}
          <div style={{ marginBottom: "28px" }}>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 12px" }}>
              Categoría
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {categorias.map(cat => (
                <label key={cat} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <div
                    onClick={() => toggleCategoria(cat)}
                    style={{
                      width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0,
                      border: `2px solid ${categoriasSeleccionadas.includes(cat) ? "#111" : "#ddd"}`,
                      background: categoriasSeleccionadas.includes(cat) ? "#111" : "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s", cursor: "pointer"
                    }}>
                    {categoriasSeleccionadas.includes(cat) && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffd000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                  <span onClick={() => toggleCategoria(cat)} style={{ fontSize: "14px", color: "#333", cursor: "pointer", textTransform: "capitalize" }}>
                    {cat} <span style={{ color: "#bbb", fontSize: "12px" }}>({listaProductos[cat].length})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Precio */}
          <div style={{ marginBottom: "28px" }}>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 12px" }}>
              Precio
            </p>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="number"
                placeholder="Mín"
                value={precioMin}
                onChange={e => setPrecioMin(e.target.value)}
                style={{
                  width: "0", flex: 1, minWidth: 0, padding: "8px 10px", borderRadius: "8px",
                  border: "1.5px solid #eee", fontSize: "13px", outline: "none",
                  fontFamily: "inherit", transition: "border-color 0.2s", boxSizing: "border-box"
                }}
                onFocus={e => e.target.style.borderColor = "#111"}
                onBlur={e => e.target.style.borderColor = "#eee"}
              />
              <span style={{ color: "#ccc", fontSize: "12px", flexShrink: 0 }}>—</span>
              <input
                type="number"
                placeholder="Máx"
                value={precioMax}
                onChange={e => setPrecioMax(e.target.value)}
                style={{
                  width: "0", flex: 1, minWidth: 0, padding: "8px 10px", borderRadius: "8px",
                  border: "1.5px solid #eee", fontSize: "13px", outline: "none",
                  fontFamily: "inherit", transition: "border-color 0.2s", boxSizing: "border-box"
                }}
                onFocus={e => e.target.style.borderColor = "#111"}
                onBlur={e => e.target.style.borderColor = "#eee"}
              />
            </div>
          </div>

          {/* Marcas */}
          {marcas.length > 0 && (
            <div>
              <p style={{ fontSize: "11px", fontWeight: "700", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 12px" }}>
                Marca
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {marcas.map(marca => (
                  <label key={marca} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <div
                      onClick={() => toggleMarca(marca)}
                      style={{
                        width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0,
                        border: `2px solid ${marcasSeleccionadas.includes(marca) ? "#111" : "#ddd"}`,
                        background: marcasSeleccionadas.includes(marca) ? "#111" : "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s", cursor: "pointer"
                      }}>
                      {marcasSeleccionadas.includes(marca) && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffd000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    <span onClick={() => toggleMarca(marca)} style={{ fontSize: "14px", color: "#333", cursor: "pointer" }}>{marca}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Header del catálogo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 4px", color: "#111" }}>
                {categoriasSeleccionadas.length === 1
                  ? categoriasSeleccionadas[0].charAt(0).toUpperCase() + categoriasSeleccionadas[0].slice(1)
                  : "Todos los productos"}
              </h1>
              <p style={{ margin: 0, fontSize: "13px", color: "#aaa" }}>
                {productosFiltrados.length} {productosFiltrados.length === 1 ? "producto" : "productos"}
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              {/* Buscador */}
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  style={{
                    padding: "9px 14px 9px 36px", borderRadius: "10px",
                    border: "1.5px solid #eee", fontSize: "13px", outline: "none",
                    fontFamily: "inherit", width: "200px", transition: "border-color 0.2s"
                  }}
                  onFocus={e => e.target.style.borderColor = "#111"}
                  onBlur={e => e.target.style.borderColor = "#eee"}
                />
                <svg style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "#bbb" }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                {busqueda && (
                  <button onClick={() => setBusqueda("")} style={{
                    position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#bbb", padding: 0, display: "flex"
                  }}><IconClose /></button>
                )}
              </div>

              {/* Ordenar */}
              <select
                value={ordenar}
                onChange={e => setOrdenar(e.target.value)}
                style={{
                  padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #eee",
                  fontSize: "13px", outline: "none", fontFamily: "inherit",
                  background: "white", cursor: "pointer", color: "#333"
                }}
              >
                <option value="default">Ordenar por</option>
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
                <option value="nombre">Nombre A-Z</option>
              </select>

              {/* Vista grilla/lista */}
              <div style={{ display: "flex", border: "1.5px solid #eee", borderRadius: "10px", overflow: "hidden" }}>
                <button onClick={() => setVistaLista(false)} style={{
                  padding: "8px 11px", background: !vistaLista ? "#111" : "white",
                  color: !vistaLista ? "#ffd000" : "#aaa", border: "none", cursor: "pointer", transition: "all 0.15s"
                }}><IconGrid /></button>
                <button onClick={() => setVistaLista(true)} style={{
                  padding: "8px 11px", background: vistaLista ? "#111" : "white",
                  color: vistaLista ? "#ffd000" : "#aaa", border: "none", cursor: "pointer", transition: "all 0.15s"
                }}><IconList /></button>
              </div>

              {/* Filtros mobile */}
              <button onClick={() => setFiltrosMobileAbiertos(true)} className="filtros-mobile-btn" style={{
                display: "none", alignItems: "center", gap: "6px",
                padding: "9px 14px", background: "#111", color: "#ffd000",
                border: "none", borderRadius: "10px", fontWeight: "700",
                fontSize: "13px", cursor: "pointer", fontFamily: "inherit"
              }}>
                <IconFilter /> Filtros {hayFiltrosActivos && <span style={{ background: "#ffd000", color: "#111", borderRadius: "50%", width: "16px", height: "16px", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>{categoriasSeleccionadas.length + marcasSeleccionadas.length + (precioMin || precioMax ? 1 : 0)}</span>}
              </button>
            </div>
          </div>

          {/* Tags de filtros activos */}
          {hayFiltrosActivos && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
              {categoriasSeleccionadas.map(cat => (
                <span key={cat} onClick={() => toggleCategoria(cat)} style={{
                  background: "#111", color: "#ffd000", padding: "5px 12px",
                  borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                }}>
                  {cat} <IconClose />
                </span>
              ))}
              {marcasSeleccionadas.map(marca => (
                <span key={marca} onClick={() => toggleMarca(marca)} style={{
                  background: "#111", color: "#ffd000", padding: "5px 12px",
                  borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                }}>
                  {marca} <IconClose />
                </span>
              ))}
              {(precioMin || precioMax) && (
                <span onClick={() => { setPrecioMin(""); setPrecioMax(""); }} style={{
                  background: "#111", color: "#ffd000", padding: "5px 12px",
                  borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                }}>
                  ${precioMin || "0"} — ${precioMax || "∞"} <IconClose />
                </span>
              )}
              <span onClick={limpiarFiltros} style={{
                background: "#f4f4f4", color: "#888", padding: "5px 12px",
                borderRadius: "20px", fontSize: "12px", fontWeight: "600", cursor: "pointer"
              }}>
                Limpiar todo
              </span>
            </div>
          )}

          {/* Sin resultados */}
          {productosFiltrados.length === 0 && (
            <div style={{
              background: "white", borderRadius: "20px", padding: "60px 40px",
              textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
            }}>
              <svg style={{ color: "#ddd", marginBottom: "16px" }} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p style={{ color: "#aaa", fontSize: "15px", margin: "0 0 16px" }}>No encontramos productos con esos filtros</p>
              <button onClick={limpiarFiltros} style={{
                background: "#ffd000", border: "none", padding: "10px 24px",
                borderRadius: "20px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit"
              }}>Ver todos los productos</button>
            </div>
          )}

          {/* Grilla de productos */}
          {!vistaLista ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
              gap: "20px"
            }}>
              {productosFiltrados.map(producto => (
                <div key={producto.id}
                  onClick={() => navigate(`/producto/${producto.id}`)}
                  style={{
                    background: "white", borderRadius: "18px", overflow: "hidden",
                    border: "1px solid #f0f0f0", cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s"
                  }}
                  onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
                  onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ height: "190px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", overflow: "hidden" }}>
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      style={{ maxWidth: "100%", maxHeight: "170px", objectFit: "contain" }}
                      onError={e => { e.target.style.display = "none"; e.target.parentNode.style.background = "#f0f0f0"; }}
                    />
                  </div>
                  <div style={{ padding: "16px", background: "white" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.6px" }}>{producto.categoria}</span>
                      {!productoTieneStock(producto) && (
                        <span style={{ fontSize: "10px", fontWeight: "700", color: "#dc2626", background: "#fef2f2", padding: "2px 7px", borderRadius: "8px" }}>Sin stock</span>
                      )}
                    </div>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "#856404", background: producto.marca ? "#fffbe6" : "transparent", padding: "2px 7px", borderRadius: "10px", marginLeft: "6px", minHeight: "16px", display: "inline-block" }}>{producto.marca || " "}</span>
                    <p style={{ margin: "6px 0 4px", fontWeight: "600", fontSize: "14px", color: "#111", lineHeight: 1.3 }}>{producto.nombre}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
                      <span style={{ fontWeight: "700", fontSize: "16px", color: "#111" }}>${producto.precio.toLocaleString("es-AR")}</span>
                      <button
                        onClick={e => productoTieneStock(producto) && handleAgregar(e, producto)}
                        disabled={!productoTieneStock(producto)}
                        style={{
                          background: !productoTieneStock(producto) ? "#f0f0f0" : agregadoId === producto.id ? "#111" : "#ffd000",
                          color: !productoTieneStock(producto) ? "#ccc" : agregadoId === producto.id ? "#ffd000" : "#111",
                          border: "none", padding: "8px 12px", borderRadius: "10px",
                          fontWeight: "700", cursor: !productoTieneStock(producto) ? "not-allowed" : "pointer", fontSize: "12px",
                          display: "flex", alignItems: "center", gap: "5px",
                          transition: "all 0.2s", fontFamily: "inherit"
                        }}
                      >
                        {!productoTieneStock(producto) ? "Sin stock" : agregadoId === producto.id ? "✓" : <><IconCart /> Agregar</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Vista lista */
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {productosFiltrados.map(producto => (
                <div key={producto.id}
                  onClick={() => navigate(`/producto/${producto.id}`)}
                  style={{
                    background: "white", borderRadius: "16px", overflow: "hidden",
                    border: "1px solid #f0f0f0", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "0",
                    transition: "box-shadow 0.2s"
                  }}
                  onMouseOver={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.07)"}
                  onMouseOut={e => e.currentTarget.style.boxShadow = "none"}
                >
                  <div style={{ width: "100px", height: "100px", flexShrink: 0, background: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: "12px" }}>
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      style={{ maxWidth: "100%", maxHeight: "80px", objectFit: "contain" }}
                      onError={e => { e.target.style.display = "none"; }}
                    />
                  </div>
                  <div style={{ flex: 1, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                    <div>
                      <div style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "10px", fontWeight: "700", color: "#aaa", textTransform: "uppercase" }}>{producto.categoria}</span>
                        <span style={{ fontSize: "10px", fontWeight: "700", color: "#856404", background: producto.marca ? "#fffbe6" : "transparent", padding: "1px 6px", borderRadius: "8px", minHeight: "14px", display: "inline-block" }}>{producto.marca || " "}</span>
                      </div>
                      <p style={{ margin: 0, fontWeight: "600", fontSize: "15px", color: "#111" }}>{producto.nombre}</p>
                      {producto.descripcion && <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#aaa", lineHeight: 1.4 }}>{producto.descripcion.slice(0, 80)}{producto.descripcion.length > 80 ? "..." : ""}</p>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                      <span style={{ fontWeight: "700", fontSize: "18px", color: "#111" }}>${producto.precio.toLocaleString("es-AR")}</span>
                      <button
                        onClick={e => productoTieneStock(producto) && handleAgregar(e, producto)}
                        disabled={!productoTieneStock(producto)}
                        style={{
                          background: !productoTieneStock(producto) ? "#f0f0f0" : agregadoId === producto.id ? "#111" : "#ffd000",
                          color: !productoTieneStock(producto) ? "#ccc" : agregadoId === producto.id ? "#ffd000" : "#111",
                          border: "none", padding: "10px 16px", borderRadius: "10px",
                          fontWeight: "700", cursor: !productoTieneStock(producto) ? "not-allowed" : "pointer", fontSize: "13px",
                          display: "flex", alignItems: "center", gap: "6px",
                          transition: "all 0.2s", fontFamily: "inherit", whiteSpace: "nowrap"
                        }}
                      >
                        {!productoTieneStock(producto) ? "Sin stock" : agregadoId === producto.id ? "✓ Agregado" : <><IconCart /> Agregar</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FILTROS MOBILE — drawer */}
      {filtrosMobileAbiertos && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} onClick={() => setFiltrosMobileAbiertos(false)} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "white", borderRadius: "24px 24px 0 0",
            padding: "28px 24px", maxHeight: "80vh", overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <span style={{ fontWeight: "700", fontSize: "18px" }}>Filtros</span>
              <button onClick={() => setFiltrosMobileAbiertos(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><IconClose /></button>
            </div>

            <p style={{ fontSize: "11px", fontWeight: "700", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 12px" }}>Categoría</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
              {categorias.map(cat => (
                <button key={cat} onClick={() => toggleCategoria(cat)} style={{
                  padding: "8px 16px", borderRadius: "20px", fontWeight: "600", fontSize: "13px",
                  border: `2px solid ${categoriasSeleccionadas.includes(cat) ? "#111" : "#eee"}`,
                  background: categoriasSeleccionadas.includes(cat) ? "#111" : "white",
                  color: categoriasSeleccionadas.includes(cat) ? "#ffd000" : "#555",
                  cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize"
                }}>{cat}</button>
              ))}
            </div>

            {marcas.length > 0 && <>
              <p style={{ fontSize: "11px", fontWeight: "700", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 12px" }}>Marca</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
                {marcas.map(marca => (
                  <button key={marca} onClick={() => toggleMarca(marca)} style={{
                    padding: "8px 16px", borderRadius: "20px", fontWeight: "600", fontSize: "13px",
                    border: `2px solid ${marcasSeleccionadas.includes(marca) ? "#111" : "#eee"}`,
                    background: marcasSeleccionadas.includes(marca) ? "#111" : "white",
                    color: marcasSeleccionadas.includes(marca) ? "#ffd000" : "#555",
                    cursor: "pointer", fontFamily: "inherit"
                  }}>{marca}</button>
                ))}
              </div>
            </>}

            <p style={{ fontSize: "11px", fontWeight: "700", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 12px" }}>Precio</p>
            <div style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
              <input type="number" placeholder="Mín" value={precioMin} onChange={e => setPrecioMin(e.target.value)}
                style={{ flex: 1, padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #eee", fontSize: "14px", outline: "none", fontFamily: "inherit" }} />
              <input type="number" placeholder="Máx" value={precioMax} onChange={e => setPrecioMax(e.target.value)}
                style={{ flex: 1, padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #eee", fontSize: "14px", outline: "none", fontFamily: "inherit" }} />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              {hayFiltrosActivos && (
                <button onClick={() => { limpiarFiltros(); setFiltrosMobileAbiertos(false); }} style={{
                  flex: 1, padding: "14px", background: "#f4f4f4", border: "none", borderRadius: "12px",
                  fontWeight: "700", cursor: "pointer", fontSize: "14px", fontFamily: "inherit"
                }}>Limpiar</button>
              )}
              <button onClick={() => setFiltrosMobileAbiertos(false)} style={{
                flex: 2, padding: "14px", background: "#111", color: "#ffd000", border: "none", borderRadius: "12px",
                fontWeight: "700", cursor: "pointer", fontSize: "14px", fontFamily: "inherit"
              }}>Ver {productosFiltrados.length} productos</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .filtros-sidebar-desktop { display: none !important; }
          .filtros-mobile-btn { display: flex !important; }
        }
      `}</style>

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
              <a href="/#como-comprar">Cómo comprar</a>
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
    </div>
  );
}

export default Catalogo;
