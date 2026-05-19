import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconCart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconMessage = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);
const IconFrown = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);
const IconChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IconChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

function DetalleProducto({ agregarAlCarrito }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [agregado, setAgregado] = useState(false);
  const [resenas, setResenas] = useState([]);
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [estrellasHover, setEstrellasHover] = useState(0);
  const [fotoActual, setFotoActual] = useState(0);
  const [variantesElegidas, setVariantesElegidas] = useState({});
  const clienteToken = localStorage.getItem("clienteToken");

  useEffect(() => {
    if (!id) return;
    setCargando(true);
    setFotoActual(0);
    setVariantesElegidas({});
    fetch("https://funtechstore-production.up.railway.app/productos")
      .then(r => r.json())
      .then(data => {
        let encontrado = null;
        let relacionadosEncontrados = [];
        for (const [cat, items] of Object.entries(data)) {
          const prod = items.find(p => String(p.id) === String(id));
          if (prod) {
            encontrado = { ...prod, categoria: cat };
            relacionadosEncontrados = items.filter(p => String(p.id) !== String(id)).slice(0, 4);
            break;
          }
        }
        setProducto(encontrado);
        setRelacionados(relacionadosEncontrados);
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch(`https://funtechstore-production.up.railway.app/resenas/${id}`)
      .then(r => r.json()).then(setResenas).catch(console.error);
  }, [id]);

  const enviarResena = async () => {
    if (estrellas === 0) return alert("Seleccioná una puntuación");
    if (!comentario.trim()) return alert("Escribí un comentario");
    setEnviando(true);
    try {
      const response = await fetch("https://funtechstore-production.up.railway.app/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${clienteToken}` },
        body: JSON.stringify({ productoId: id, estrellas, comentario })
      });
      const data = await response.json();
      if (response.ok) {
        setComentario(""); setEstrellas(0);
        const res = await fetch(`https://funtechstore-production.up.railway.app/resenas/${id}`);
        setResenas(await res.json());
      } else { alert(data.message || "Error al enviar reseña"); }
    } catch { alert("Error de conexión"); }
    finally { setEnviando(false); }
  };

  const handleAgregar = () => {
    const variantes = producto.variantes || [];
    // Verificar si hay stock (producto sin variantes)
    if (variantes.length === 0 && (producto.stock ?? 0) <= 0) return;
    for (const v of variantes) {
      if (!variantesElegidas[v.nombre]) {
        alert(`Elegí una opción para: ${v.nombre}`);
        return;
      }
      const opcion = v.opciones.find(op => (op.nombre || op) === variantesElegidas[v.nombre]);
      if (opcion && (opcion.stock ?? 0) <= 0) return;
    }
    agregarAlCarrito({ ...producto, variantesElegidas });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  // Helper: tiene stock disponible considerando variantes elegidas
  const tieneStock = () => {
    const variantes = producto?.variantes || [];
    if (variantes.length === 0) return (producto?.stock ?? 0) > 0;
    return variantes.every(v => {
      if (!variantesElegidas[v.nombre]) return true; // no elegida aún
      const op = v.opciones.find(o => (o.nombre || o) === variantesElegidas[v.nombre]);
      return op ? (op.stock ?? 0) > 0 : true;
    });
  };

  const promedioEstrellas = resenas.length > 0
    ? (resenas.reduce((acc, r) => acc + r.estrellas, 0) / resenas.length).toFixed(1)
    : null;

  // Soporta array de imágenes o imagen única
  const fotos = producto
    ? (Array.isArray(producto.imagenes) && producto.imagenes.length > 0
        ? producto.imagenes
        : producto.imagen ? [producto.imagen] : [])
    : [];

  if (cargando) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9f9f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "36px", height: "36px", border: "3px solid #eee", borderTop: "3px solid #111", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!producto) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9f9f9", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <div style={{ color: "#ccc" }}><IconFrown /></div>
        <p style={{ color: "#888", fontSize: "16px", margin: 0 }}>Producto no encontrado</p>
        <button onClick={() => navigate("/")}
          style={{ marginTop: "8px", background: "#ffd000", border: "none", padding: "12px 30px", borderRadius: "30px", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}>
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>

      {/* Navbar */}
      <div style={{
        background: "white", borderBottom: "1px solid #f0f0f0",
        padding: "16px 32px", display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 12px rgba(0,0,0,0.04)"
      }}>
        <img src="/logo.svg" alt="Funtek" style={{ height: "38px" }} />
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
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 20px" }}>

        {/* Detalle principal */}
        <style>{`
          .detalle-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            background: white;
            border-radius: 24px;
            padding: 50px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          }
          .detalle-galeria-foto {
            background: white;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 360px;
            overflow: hidden;
            padding: 24px;
            position: relative;
          }
          .detalle-miniaturas {
            display: flex;
            gap: 10px;
            margin-top: 14px;
            flex-wrap: wrap;
            justify-content: flex-start;
          }
          @media (max-width: 768px) {
            .detalle-grid {
              grid-template-columns: 1fr;
              gap: 24px;
              padding: 20px;
              border-radius: 16px;
            }
            .detalle-galeria-foto {
              min-height: 260px;
              padding: 16px;
            }
            .detalle-miniaturas {
              justify-content: center;
            }
          }
        `}</style>
        <div className="detalle-grid">

          {/* Galería */}
          <div>
            {/* Foto principal */}
            <div className="detalle-galeria-foto">
              {fotos.length > 0 ? (
                <img src={fotos[fotoActual]} alt={producto.nombre}
                  style={{ maxWidth: "100%", maxHeight: "380px", objectFit: "contain", transition: "opacity 0.2s" }} />
              ) : (
                <div style={{ color: "#ddd", fontSize: "14px" }}>Sin imagen</div>
              )}

              {fotos.length > 1 && <>
                <button onClick={() => setFotoActual(p => (p - 1 + fotos.length) % fotos.length)} style={{
                  position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                  background: "white", border: "none", borderRadius: "50%", width: "36px", height: "36px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
                }}><IconChevronLeft /></button>
                <button onClick={() => setFotoActual(p => (p + 1) % fotos.length)} style={{
                  position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                  background: "white", border: "none", borderRadius: "50%", width: "36px", height: "36px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
                }}><IconChevronRight /></button>
              </>}
            </div>

            {/* Miniaturas */}
            {fotos.length > 1 && (
              <div className="detalle-miniaturas">
                {fotos.map((foto, i) => (
                  <div key={i} onClick={() => setFotoActual(i)} style={{
                    width: "64px", height: "64px", borderRadius: "10px", background: "white",
                    cursor: "pointer", overflow: "hidden", padding: "6px", boxSizing: "border-box",
                    border: `2px solid ${fotoActual === i ? "#111" : "transparent"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "border-color 0.15s"
                  }}>
                    <img src={foto} alt={`Foto ${i + 1}`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "18px", flexWrap: "wrap" }}>
              {producto.categoria && (
                <span style={{ background: "#f4f4f4", color: "#666", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  {producto.categoria}
                </span>
              )}
              {producto.marca && (
                <span style={{ background: "#fffbe6", color: "#856404", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  {producto.marca}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: "26px", fontWeight: "700", margin: "0 0 12px", color: "#111", lineHeight: 1.3 }}>
              {producto.nombre}
            </h1>

            {promedioEstrellas && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "2px" }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{ fontSize: "15px", color: s <= Math.round(parseFloat(promedioEstrellas)) ? "#ffd000" : "#e8e8e8" }}>★</span>
                  ))}
                </div>
                <span style={{ fontSize: "13px", color: "#aaa" }}>
                  {promedioEstrellas} · {resenas.length} {resenas.length === 1 ? "reseña" : "reseñas"}
                </span>
              </div>
            )}

            <p style={{ fontSize: "34px", fontWeight: "700", color: "#111", margin: "0 0 24px", letterSpacing: "-0.5px" }}>
              ${producto.precio.toLocaleString("es-AR")}
            </p>

            {producto.descripcion ? (
              <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.8, margin: "0 0 32px" }}>{producto.descripcion}</p>
            ) : (
              <p style={{ fontSize: "14px", color: "#bbb", lineHeight: 1.8, margin: "0 0 32px", fontStyle: "italic" }}>Sin descripción disponible.</p>
            )}

            {/* Variantes */}
            {(producto.variantes || []).length > 0 && (
              <div style={{ marginBottom: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {producto.variantes.map(v => (
                  <div key={v.nombre}>
                    <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "700", color: "#555" }}>
                      {v.nombre}
                      {variantesElegidas[v.nombre] && (
                        <span style={{ color: "#111", marginLeft: "8px" }}>— {variantesElegidas[v.nombre]}</span>
                      )}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {v.opciones.map(op => {
                        const opNombre = op.nombre || op;
                        const sinStock = (op.stock ?? 0) <= 0;
                        const seleccionada = variantesElegidas[v.nombre] === opNombre;
                        return (
                          <button key={opNombre}
                            disabled={sinStock}
                            onClick={() => !sinStock && setVariantesElegidas({ ...variantesElegidas, [v.nombre]: opNombre })}
                            style={{
                              padding: "8px 16px", borderRadius: "20px", border: "2px solid",
                              borderColor: seleccionada ? "#111" : sinStock ? "#f0f0f0" : "#e8e8e8",
                              background: seleccionada ? "#111" : sinStock ? "#f9f9f9" : "white",
                              color: seleccionada ? "#ffd000" : sinStock ? "#ccc" : "#555",
                              fontWeight: "600", fontSize: "13px",
                              cursor: sinStock ? "not-allowed" : "pointer",
                              transition: "all 0.15s", fontFamily: "inherit",
                              textDecoration: sinStock ? "line-through" : "none",
                              position: "relative"
                            }}>
                            {opNombre}
                            {sinStock && <span style={{ fontSize: "10px", display: "block", lineHeight: 1, color: "#bbb", textDecoration: "none" }}>Sin stock</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(() => {
              const variantes = producto.variantes || [];
              const sinStockTotal = variantes.length === 0 && (producto.stock ?? 0) <= 0;
              const sinStockVariante = variantes.length > 0 && Object.keys(variantesElegidas).length > 0 && !tieneStock();
              const noHayStock = sinStockTotal || sinStockVariante;
              return (
                <button onClick={handleAgregar} disabled={noHayStock}
                  style={{
                    background: noHayStock ? "#f0f0f0" : agregado ? "#111" : "#ffd000",
                    color: noHayStock ? "#bbb" : agregado ? "#ffd000" : "#111",
                    border: "none", padding: "16px 30px", borderRadius: "14px", fontSize: "15px",
                    fontWeight: "700", cursor: noHayStock ? "not-allowed" : "pointer",
                    transition: "all 0.25s", width: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontFamily: "inherit"
                  }}>
                  {noHayStock ? "Sin stock" : agregado ? <><IconCheck /> Agregado al carrito</> : <><IconCart /> Agregar al carrito</>}
                </button>
              );
            })()}
          </div>
        </div>

        {/* Reseñas */}
        <div style={{ marginTop: "60px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "28px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>Reseñas</h2>
            {resenas.length > 0 && <span style={{ fontSize: "14px", color: "#aaa" }}>{resenas.length} {resenas.length === 1 ? "reseña" : "reseñas"}</span>}
          </div>

          {resenas.length > 0 && (
            <div style={{ background: "white", borderRadius: "16px", padding: "24px 30px", marginBottom: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "20px" }}>
              <span style={{ fontSize: "44px", fontWeight: "700", letterSpacing: "-2px", color: "#111" }}>{promedioEstrellas}</span>
              <div>
                <div style={{ display: "flex", gap: "3px", marginBottom: "6px" }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: "22px", color: s <= Math.round(parseFloat(promedioEstrellas)) ? "#ffd000" : "#eee" }}>★</span>)}
                </div>
                <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>Basado en {resenas.length} {resenas.length === 1 ? "reseña" : "reseñas"}</p>
              </div>
            </div>
          )}

          {clienteToken ? (
            <div style={{ background: "white", borderRadius: "16px", padding: "30px", marginBottom: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: "700", color: "#111" }}>Dejá tu reseña</h3>
              <div style={{ display: "flex", gap: "4px", marginBottom: "20px" }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} onClick={() => setEstrellas(s)} onMouseEnter={() => setEstrellasHover(s)} onMouseLeave={() => setEstrellasHover(0)}
                    style={{ fontSize: "32px", cursor: "pointer", color: s <= (estrellasHover || estrellas) ? "#ffd000" : "#e8e8e8", transition: "color 0.1s, transform 0.1s", transform: s <= (estrellasHover || estrellas) ? "scale(1.15)" : "scale(1)", display: "inline-block" }}>★</span>
                ))}
              </div>
              <textarea placeholder="Contá tu experiencia con este producto..." value={comentario} onChange={e => setComentario(e.target.value)}
                style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1.5px solid #eee", fontSize: "14px", resize: "vertical", minHeight: "100px", boxSizing: "border-box", outline: "none", marginBottom: "16px", fontFamily: "inherit", lineHeight: "1.6", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#111"} onBlur={e => e.target.style.borderColor = "#eee"} />
              <button onClick={enviarResena} disabled={enviando}
                style={{ background: "#111", color: "#ffd000", border: "none", padding: "12px 28px", borderRadius: "12px", fontWeight: "700", cursor: enviando ? "not-allowed" : "pointer", fontSize: "14px", opacity: enviando ? 0.6 : 1, fontFamily: "inherit" }}>
                {enviando ? "Publicando..." : "Publicar reseña"}
              </button>
            </div>
          ) : (
            <div style={{ background: "#fafafa", border: "1.5px dashed #e8e8e8", borderRadius: "16px", padding: "24px 30px", marginBottom: "20px", textAlign: "center" }}>
              <p style={{ margin: 0, color: "#888", fontSize: "14px" }}>
                <a href="/login" style={{ color: "#111", fontWeight: "700", textDecoration: "none" }}>Iniciá sesión</a> para dejar una reseña
              </p>
            </div>
          )}

          {resenas.length === 0 && (
            <div style={{ background: "white", borderRadius: "16px", padding: "48px 40px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
              <div style={{ color: "#ddd", marginBottom: "12px", display: "flex", justifyContent: "center" }}><IconMessage /></div>
              <p style={{ color: "#aaa", fontSize: "14px", margin: 0 }}>Todavía no hay reseñas. ¡Sé el primero!</p>
            </div>
          )}

          {resenas.map((resena) => (
            <div key={resena._id} style={{ background: "white", borderRadius: "16px", padding: "24px 28px", marginBottom: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: "700", fontSize: "14px", color: "#111" }}>{resena.nombreUsuario}</p>
                  <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#bbb" }}>{new Date(resena.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                </div>
                <div style={{ display: "flex", gap: "2px" }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: "16px", color: s <= resena.estrellas ? "#ffd000" : "#eee" }}>★</span>)}
                </div>
              </div>
              <p style={{ margin: 0, fontSize: "14px", color: "#555", lineHeight: 1.7 }}>{resena.comentario}</p>
            </div>
          ))}
        </div>

        {/* Relacionados */}
        {relacionados.length > 0 && (
          <div style={{ marginTop: "60px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px" }}>Productos relacionados</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
              {relacionados.map((rel) => (
                <div key={rel.id} onClick={() => navigate(`/producto/${rel.id}`)}
                  style={{ background: "white", borderRadius: "18px", overflow: "hidden", border: "1px solid #f0f0f0", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
                  onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
                  onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ height: "180px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
                    <img src={Array.isArray(rel.imagenes) && rel.imagenes.length > 0 ? rel.imagenes[0] : rel.imagen} alt={rel.nombre}
                      style={{ maxWidth: "100%", maxHeight: "160px", objectFit: "contain" }} />
                  </div>
                  <div style={{ padding: "16px" }}>
                    <p style={{ margin: "0 0 4px", fontWeight: "600", fontSize: "14px", color: "#111", lineHeight: 1.4 }}>{rel.nombre}</p>
                    <p style={{ margin: "0 0 14px", fontWeight: "700", fontSize: "16px", color: "#111" }}>${rel.precio.toLocaleString("es-AR")}</p>
                    <button onClick={e => { e.stopPropagation(); agregarAlCarrito(rel); }}
                      style={{ width: "100%", background: "#ffd000", border: "none", padding: "9px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>
                      Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DetalleProducto;
