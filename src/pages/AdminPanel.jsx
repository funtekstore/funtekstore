import { useEffect, useState } from "react";
import DashboardCharts from "../components/DashboardCharts";
import productosIniciales from "../data/productos";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

  .admin-wrap * { box-sizing: border-box; }
  .admin-wrap {
    min-height: 100vh;
    background: #f5f5f5;
    font-family: 'DM Sans', sans-serif;
    color: #111;
  }

  /* HEADER */
  .admin-header {
    background: #111;
    padding: 0 40px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
    gap: 16px;
  }
  .admin-header-left { display: flex; align-items: center; gap: 16px; }
  .admin-badge {
    background: #ffd000;
    color: #111;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .admin-header-right { display: flex; align-items: center; gap: 12px; }
  .admin-header-link {
    color: rgba(255,255,255,0.5);
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: color 0.2s;
    padding: 8px 12px;
    border-radius: 8px;
  }
  .admin-header-link:hover { color: white; background: rgba(255,255,255,0.07); }
  .admin-logout-btn {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.7);
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .admin-logout-btn:hover { background: rgba(255,255,255,0.14); color: white; }

  /* TABS */
  .admin-tabs {
    background: #111;
    padding: 0 40px;
    display: flex;
    gap: 4px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .admin-tab {
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.4);
    padding: 14px 22px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .admin-tab:hover { color: rgba(255,255,255,0.7); }
  .admin-tab.active { color: #ffd000; border-bottom-color: #ffd000; }

  /* CONTENIDO */
  .admin-content { max-width: 1200px; margin: 0 auto; padding: 40px 24px; }

  /* STATS */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 14px;
    margin-bottom: 32px;
  }
  .stat-card {
    background: white;
    border-radius: 16px;
    padding: 20px 22px;
    border: 1.5px solid #ebebeb;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.07); }
  .stat-card.accent { background: #111; border-color: #111; }
  .stat-label { font-size: 12px; color: #999; font-weight: 500; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.4px; }
  .stat-card.accent .stat-label { color: rgba(255,255,255,0.4); }
  .stat-value { font-size: 26px; font-weight: 700; margin: 0; line-height: 1; }
  .stat-card.accent .stat-value { color: #ffd000; }
  .stat-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; margin-bottom: 12px; }

  /* FILTROS */
  .filtros-row { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
  .filtro-pill {
    padding: 8px 18px;
    border-radius: 30px;
    border: 1.5px solid #ebebeb;
    background: white;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: #666;
    transition: all 0.15s;
  }
  .filtro-pill:hover { border-color: #111; color: #111; }
  .filtro-pill.active { background: #111; color: #ffd000; border-color: #111; }

  /* PEDIDO CARD */
  .pedido-card {
    background: white;
    border-radius: 16px;
    padding: 24px 28px;
    margin-bottom: 12px;
    border: 1.5px solid #ebebeb;
    transition: box-shadow 0.2s;
  }
  .pedido-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.06); }
  .pedido-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; flex-wrap: wrap; gap: 10px; }
  .pedido-nombre { margin: 0; font-size: 15px; font-weight: 700; }
  .pedido-meta { margin: 3px 0 0; font-size: 13px; color: #999; }
  .estado-badge { padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; white-space: nowrap; }
  .pedido-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5; font-size: 14px; color: #555; }
  .pedido-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; flex-wrap: wrap; gap: 10px; }
  .pedido-total { font-size: 16px; font-weight: 700; }
  .pedido-acciones { display: flex; gap: 8px; }
  .btn-estado {
    border: none; padding: 9px 18px; border-radius: 10px; font-weight: 700; cursor: pointer;
    font-size: 13px; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; gap: 6px; transition: opacity 0.2s;
  }
  .btn-estado:hover { opacity: 0.85; }
  .btn-enviado { background: #111; color: #ffd000; }
  .btn-entregado { background: #d4edda; color: #155724; }

  /* SECCION TITULO */
  .section-title { font-family: 'DM Serif Display', serif; font-size: 24px; font-weight: 400; margin: 0 0 28px; color: #111; }

  /* PRODUCTOS */
  .productos-layout { display: grid; grid-template-columns: 340px 1fr; gap: 24px; }
  @media (max-width: 900px) { .productos-layout { grid-template-columns: 1fr; } }

  .panel-card { background: white; border-radius: 16px; padding: 24px; border: 1.5px solid #ebebeb; margin-bottom: 16px; }
  .panel-card-title { font-size: 14px; font-weight: 700; margin: 0 0 18px; color: #111; display: flex; align-items: center; gap: 8px; }

  /* INPUTS */
  .admin-input {
    width: 100%; padding: 11px 14px; border-radius: 10px; border: 1.5px solid #ebebeb;
    font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; background: white; color: #111;
  }
  .admin-input:focus { border-color: #111; }
  .admin-input-group { display: flex; flex-direction: column; gap: 10px; }

  .btn-primary {
    width: 100%; background: #111; color: #ffd000; border: none; padding: 12px; border-radius: 10px;
    font-weight: 700; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.2s;
  }
  .btn-primary:hover { background: #222; }
  .btn-secondary {
    width: 100%; background: #ffd000; color: #111; border: none; padding: 12px; border-radius: 10px;
    font-weight: 700; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: opacity 0.2s;
  }
  .btn-secondary:hover { opacity: 0.85; }

  /* LISTA PRODUCTOS */
  .cat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .cat-title { margin: 0; font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
  .cat-count { background: #f0f0f0; color: #888; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 600; }
  .btn-del-cat { background: #fff0f0; color: #e53e3e; border: none; padding: 5px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 700; font-family: 'DM Sans', sans-serif; transition: background 0.15s; }
  .btn-del-cat:hover { background: #ffe0e0; }

  .producto-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
  .producto-row:last-child { border-bottom: none; }
  .producto-thumb { width: 44px; height: 44px; object-fit: contain; border-radius: 8px; background: #f8f8f8; flex-shrink: 0; }
  .producto-info { flex: 1; min-width: 0; }
  .producto-nombre { margin: 0; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .producto-precio { margin: 2px 0 0; font-size: 12px; color: #999; }
  .btn-edit { background: #fffbe6; border: none; cursor: pointer; padding: 7px 9px; border-radius: 8px; flex-shrink: 0; transition: background 0.15s; color: #b45309; display: flex; align-items: center; }
  .btn-edit:hover { background: #fff3c0; }
  .btn-del { background: none; border: none; cursor: pointer; padding: 7px; flex-shrink: 0; color: #ccc; transition: color 0.15s; display: flex; align-items: center; }
  .btn-del:hover { color: #e53e3e; }
  .btn-reorder {
    background: none; border: 1px solid #e8e8e8; cursor: pointer; padding: 3px 5px;
    border-radius: 6px; color: #999; display: flex; align-items: center; justify-content: center;
    transition: all 0.15s; flex-shrink: 0;
  }
  .btn-reorder:hover:not(:disabled) { background: #f0f0f0; color: #111; border-color: #ccc; }
  .btn-reorder:disabled { opacity: 0.25; cursor: not-allowed; }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center;
    justify-content: center; z-index: 2000; backdrop-filter: blur(4px); padding: 20px;
  }
  .modal-box {
    background: white; border-radius: 20px; padding: 32px; width: 100%; max-width: 460px;
    box-shadow: 0 30px 80px rgba(0,0,0,0.2); animation: modalIn 0.2s ease;
    max-height: 90vh; overflow-y: auto;
  }
  @keyframes modalIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .modal-title { margin: 0; font-size: 17px; font-weight: 700; }
  .modal-close { background: #f5f5f5; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; color: #666; }
  .modal-close:hover { background: #eee; }
  .modal-label { font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.4px; display: block; margin-bottom: 6px; }
  .modal-field { margin-bottom: 14px; }
  .modal-preview { margin: 12px 0; text-align: center; background: #f8f8f8; border-radius: 10px; padding: 12px; }
  .modal-preview img { max-height: 110px; max-width: 100%; object-fit: contain; }
  .modal-actions { display: flex; gap: 10px; margin-top: 20px; }
  .modal-btn-cancel { flex: 1; padding: 12px; border-radius: 10px; border: 1.5px solid #ebebeb; background: white; cursor: pointer; font-weight: 600; font-size: 14px; font-family: 'DM Sans', sans-serif; }
  .modal-btn-save { flex: 2; padding: 12px; border-radius: 10px; border: none; background: #ffd000; cursor: pointer; font-weight: 700; font-size: 14px; font-family: 'DM Sans', sans-serif; }

  /* EMPTY */
  .empty-state { background: white; border-radius: 16px; padding: 60px 40px; text-align: center; color: #bbb; border: 1.5px solid #ebebeb; }
  .empty-icon { font-size: 36px; margin-bottom: 10px; }
  .empty-text { font-size: 15px; }
  .chart-card { background: white; border-radius: 16px; padding: 24px; border: 1.5px solid #ebebeb; margin-bottom: 24px; }

  @media (max-width: 600px) {
    .admin-header { padding: 0 20px; }
    .admin-tabs { padding: 0 20px; }
    .admin-content { padding: 24px 16px; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

const IconPackage = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4L7.55 4.24"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IconGrid = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconEdit = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const IconTruck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconStore = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconLogout = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconPlus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconChevronUp = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>;
const IconChevronDown = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;

function AdminPanel() {
  const [tab, setTab] = useState("pedidos");
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [autorizado, setAutorizado] = useState(false);

  const [listaProductos, setListaProductos] = useState({});
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [nuevaImagen, setNuevaImagen] = useState("");
  const [nuevasImagenes, setNuevasImagenes] = useState([]);
  const [editImagenes, setEditImagenes] = useState([]);
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevaMarca, setNuevaMarca] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [productoEditando, setProductoEditando] = useState(null);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editPrecio, setEditPrecio] = useState("");
  const [editImagen, setEditImagen] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editMarca, setEditMarca] = useState("");
  const [editVariantes, setEditVariantes] = useState([]);
  const [nuevoVarianteNombre, setNuevoVarianteNombre] = useState("");
  const [nuevasVariantes, setNuevasVariantes] = useState([]);
  const [nuevoVarianteNombreForm, setNuevoVarianteNombreForm] = useState("");
  const [nuevoStock, setNuevoStock] = useState("");
  const [editStock, setEditStock] = useState(0);

  const token = () => localStorage.getItem("adminToken");

  const cargarProductos = async () => {
    setCargandoProductos(true);
    try {
      const res = await fetch("https://funtechstore-production.up.railway.app/productos");
      const data = await res.json();
      setListaProductos(data);
      if (!categoriaSeleccionada && Object.keys(data).length > 0)
        setCategoriaSeleccionada(Object.keys(data)[0]);
    } catch (e) { console.error("Error cargando productos:", e); }
    finally { setCargandoProductos(false); }
  };

  useEffect(() => {
    if (Object.keys(listaProductos).length > 0 && !categoriaSeleccionada)
      setCategoriaSeleccionada(Object.keys(listaProductos)[0]);
  }, [listaProductos]);

  const cargarPedidos = async () => {
    try {
      const response = await fetch("https://funtechstore-production.up.railway.app/pedidos", {
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (!response.ok) throw new Error("No autorizado");
      setPedidos(await response.json());
    } catch (error) { console.error("Error:", error.message); }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await fetch(`https://funtechstore-production.up.railway.app/pedidos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      cargarPedidos();
    } catch (error) { console.error("Error al cambiar estado:", error); }
  };

  useEffect(() => {
    const t = token();
    if (!t) { alert("Acceso denegado."); window.location.href = "/login-admin"; return; }
    setAutorizado(true);
    cargarPedidos();
    cargarProductos();
  }, []);

  if (!autorizado) return null;

  const totalPedidos = pedidos.length;
  const pedidosPendientes = pedidos.filter(p => p.estado === "pendiente").length;
  const pedidosEnviados = pedidos.filter(p => p.estado === "Enviado").length;
  const pedidosEntregados = pedidos.filter(p => p.estado === "Entregado").length;
  const pedidosPagados = pedidos.filter(p => p.estado === "pagado").length;
  const totalFacturado = pedidos.reduce((acc, p) => acc + p.items.reduce((s, i) => s + i.precio * i.cantidad, 0), 0);
  const pedidosFiltrados = pedidos.filter(p => filtro === "todos" ? true : p.estado === filtro);

  const colorEstado = (estado) => ({
    pendiente: { bg: "#fff8e1", color: "#b45309" },
    pagado:    { bg: "#e0f2fe", color: "#0369a1" },
    Enviado:   { bg: "#eff6ff", color: "#1d4ed8" },
    Entregado: { bg: "#f0fdf4", color: "#15803d" },
    rechazado: { bg: "#fef2f2", color: "#dc2626" }
  }[estado] || { bg: "#f5f5f5", color: "#555" });

  const crearCategoria = () => {
    const nombre = nuevaCategoria.trim().toLowerCase();
    if (!nombre) return alert("Escribí un nombre");
    if (listaProductos[nombre]) return alert("La categoría ya existe");
    setListaProductos({ ...listaProductos, [nombre]: [] });
    setNuevaCategoria(""); setCategoriaSeleccionada(nombre);
  };

  const agregarProducto = async () => {
    if (!nuevoNombre || !nuevoPrecio || !categoriaSeleccionada)
      return alert("Completá nombre, precio y categoría");
    try {
      const res = await fetch("https://funtechstore-production.up.railway.app/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ nombre: nuevoNombre, precio: parseInt(nuevoPrecio), imagen: (nuevasImagenes.map(u => u.trim()).filter(Boolean)[0]) || nuevaImagen, imagenes: nuevasImagenes.map(u => u.trim()).filter(Boolean).length > 0 ? nuevasImagenes.map(u => u.trim()).filter(Boolean) : nuevaImagen ? [nuevaImagen] : [], descripcion: nuevaDescripcion, marca: nuevaMarca, categoria: categoriaSeleccionada, stock: parseInt(nuevoStock) || 0, variantes: nuevasVariantes.filter(v => v.nombre.trim() && v.opciones.length > 0) })
      });
      if (!res.ok) return alert("Error al agregar producto");
      setNuevoNombre(""); setNuevoPrecio(""); setNuevaImagen(""); setNuevasImagenes([]); setNuevaDescripcion(""); setNuevaMarca(""); setNuevasVariantes([]); setNuevoStock("");
      await cargarProductos();
    } catch (e) { alert("Error de conexión"); }
  };

  const eliminarProducto = async (cat, id) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await fetch(`https://funtechstore-production.up.railway.app/productos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` }
      });
      await cargarProductos();
    } catch (e) { alert("Error al eliminar"); }
  };

  const eliminarCategoria = async (cat) => {
    if (!confirm(`¿Eliminar la categoría "${cat}" y todos sus productos?`)) return;
    try {
      await fetch(`https://funtechstore-production.up.railway.app/productos/categoria/${cat}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` }
      });
      await cargarProductos();
      if (categoriaSeleccionada === cat) setCategoriaSeleccionada(Object.keys(listaProductos).find(k => k !== cat) || "");
    } catch (e) { alert("Error al eliminar categoría"); }
  };

  const abrirEdicion = (cat, producto) => {
    setCategoriaEditando(cat); setProductoEditando(producto);
    setEditNombre(producto.nombre); setEditPrecio(producto.precio);
    setEditImagen(producto.imagen || "");
    const imgs = Array.isArray(producto.imagenes) && producto.imagenes.filter(u => u && u.trim()).length > 0
      ? producto.imagenes
      : producto.imagen ? [producto.imagen] : [];
    setEditImagenes(imgs);
    setEditDescripcion(producto.descripcion || ""); setEditMarca(producto.marca || "");
    setEditStock(producto.stock ?? 0);
    // Convertir variantes al nuevo formato con stock por opción
    const vars = Array.isArray(producto.variantes) ? producto.variantes.map(v => ({
      nombre: v.nombre,
      opciones: v.opciones.map(op => typeof op === "string" ? { nombre: op, stock: 0 } : op)
    })) : [];
    setEditVariantes(vars);
  };

  const cerrarEdicion = () => { setProductoEditando(null); setCategoriaEditando(null); };

  const guardarEdicion = async () => {
    if (!editNombre || !editPrecio) return alert("Completá nombre y precio");
    try {
      const imgs = editImagenes.map(u => u.trim()).filter(Boolean);
      const payload = {
        nombre: editNombre,
        precio: parseInt(editPrecio),
        imagen: imgs[0] || "",
        imagenes: imgs,
        descripcion: editDescripcion,
        marca: editMarca,
        categoria: categoriaEditando,
        stock: parseInt(editStock) || 0,
        variantes: editVariantes.filter(v => v.nombre.trim() && v.opciones.length > 0)
      };
      const res = await fetch(`https://funtechstore-production.up.railway.app/productos/${productoEditando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) return alert("Error al guardar: " + (data.error || data.message || res.status));
      cerrarEdicion();
      await cargarProductos();
    } catch (e) { alert("Error de conexión: " + e.message); }
  };

  return (
    <div className="admin-wrap">
      <style>{css}</style>

      {/* MODAL */}
      {productoEditando && (
        <div className="modal-overlay" onClick={cerrarEdicion}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Editar producto</h3>
              <button className="modal-close" onClick={cerrarEdicion}>✕</button>
            </div>
            {[
              { label: "Nombre", val: editNombre, set: setEditNombre, type: "text" },
              { label: "Precio", val: editPrecio, set: setEditPrecio, type: "number" },

              { label: "Marca", val: editMarca, set: setEditMarca, type: "text" },
            ].map(f => (
              <div className="modal-field" key={f.label}>
                <label className="modal-label">{f.label}</label>
                <input className="admin-input" type={f.type} value={f.val} onChange={e => f.set(e.target.value)} />
              </div>
            ))}
            {(editVariantes.length === 0) && (
              <div className="modal-field">
                <label className="modal-label">Stock</label>
                <input className="admin-input" type="number" min="0" value={editStock} onChange={e => setEditStock(e.target.value)} placeholder="0" />
              </div>
            )}
            <div className="modal-field">
              <label className="modal-label">Descripción</label>
              <textarea className="admin-input" value={editDescripcion} onChange={e => setEditDescripcion(e.target.value)} style={{ resize: "vertical", minHeight: "70px" }} />
            </div>
            <div className="modal-field">
              <label className="modal-label">URLs de imágenes (una por línea)</label>
              <textarea className="admin-input" placeholder={"https://url-imagen-1.jpg\nhttps://url-imagen-2.jpg"} value={editImagenes.join("\n")}
                onChange={e => setEditImagenes(e.target.value.split("\n"))}
                style={{ resize: "vertical", minHeight: "80px", fontSize: "13px" }} />
              {editImagenes.filter(u => u.trim()).length > 0 && (
                <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                  {editImagenes.filter(u => u.trim()).map((url, i) => (
                    <img key={i} src={url} alt={`img ${i+1}`} style={{ width: "56px", height: "56px", objectFit: "contain", borderRadius: "8px", background: "#f8f8f8", border: i === 0 ? "2px solid #ffd000" : "1px solid #eee" }} />
                  ))}
                </div>
              )}
            </div>
            <div className="modal-field">
              <label className="modal-label">Variantes</label>
              {editVariantes.map((v, vi) => (
                <div key={vi} style={{ background: "#f9f9f9", borderRadius: "10px", padding: "10px 12px", marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <button className="btn-reorder" disabled={vi === 0} onClick={() => {
                          const nv = [...editVariantes];
                          [nv[vi - 1], nv[vi]] = [nv[vi], nv[vi - 1]];
                          setEditVariantes(nv);
                        }}><IconChevronUp /></button>
                        <button className="btn-reorder" disabled={vi === editVariantes.length - 1} onClick={() => {
                          const nv = [...editVariantes];
                          [nv[vi], nv[vi + 1]] = [nv[vi + 1], nv[vi]];
                          setEditVariantes(nv);
                        }}><IconChevronDown /></button>
                      </div>
                      <span style={{ fontWeight: "600", fontSize: "13px" }}>{v.nombre}</span>
                    </div>
                    <button onClick={() => setEditVariantes(editVariantes.filter((_, i) => i !== vi))}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: "12px", fontWeight: "700" }}>✕ Eliminar</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
                    {v.opciones.map((op, oi) => (
                      <div key={oi} style={{ display: "flex", alignItems: "center", gap: "6px", background: "white", borderRadius: "8px", padding: "6px 10px", border: "1px solid #eee" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <button className="btn-reorder" disabled={oi === 0} onClick={() => {
                            const nv = [...editVariantes];
                            const ops = [...nv[vi].opciones];
                            [ops[oi - 1], ops[oi]] = [ops[oi], ops[oi - 1]];
                            nv[vi] = { ...nv[vi], opciones: ops };
                            setEditVariantes(nv);
                          }}><IconChevronUp /></button>
                          <button className="btn-reorder" disabled={oi === v.opciones.length - 1} onClick={() => {
                            const nv = [...editVariantes];
                            const ops = [...nv[vi].opciones];
                            [ops[oi], ops[oi + 1]] = [ops[oi + 1], ops[oi]];
                            nv[vi] = { ...nv[vi], opciones: ops };
                            setEditVariantes(nv);
                          }}><IconChevronDown /></button>
                        </div>
                        <span style={{ flex: 1, fontWeight: "600", fontSize: "13px" }}>{op.nombre}</span>
                        <span style={{ fontSize: "11px", color: "#aaa" }}>Stock:</span>
                        <input type="number" min="0" value={op.stock} onChange={e => {
                          const newVars = [...editVariantes];
                          newVars[vi] = { ...newVars[vi], opciones: newVars[vi].opciones.map((o, i) => i === oi ? { ...o, stock: parseInt(e.target.value) || 0 } : o) };
                          setEditVariantes(newVars);
                        }} style={{ width: "60px", padding: "4px 8px", borderRadius: "6px", border: "1px solid #eee", fontSize: "13px", outline: "none" }} />
                        <button onClick={() => {
                          const newVars = [...editVariantes];
                          newVars[vi] = { ...newVars[vi], opciones: newVars[vi].opciones.filter((_, i) => i !== oi) };
                          setEditVariantes(newVars);
                        }} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: "14px", padding: 0 }}>✕</button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input placeholder="Nueva opción (ej: Blanco)" className="admin-input" style={{ flex: 1, padding: "6px 10px", fontSize: "12px" }}
                      onKeyDown={e => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          const newVars = [...editVariantes];
                          newVars[vi] = { ...newVars[vi], opciones: [...newVars[vi].opciones, { nombre: e.target.value.trim(), stock: 0 }] };
                          setEditVariantes(newVars);
                          e.target.value = "";
                        }
                      }} />
                    <button style={{ background: "#ffd000", border: "none", borderRadius: "8px", padding: "6px 10px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
                      onClick={e => {
                        const input = e.target.previousSibling;
                        if (!input.value.trim()) return;
                        const newVars = [...editVariantes];
                        newVars[vi] = { ...newVars[vi], opciones: [...newVars[vi].opciones, { nombre: input.value.trim(), stock: 0 }] };
                        setEditVariantes(newVars);
                        input.value = "";
                      }}>+ Agregar</button>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                <input className="admin-input" placeholder="Nombre del grupo (ej: Color)" value={nuevoVarianteNombre} onChange={e => setNuevoVarianteNombre(e.target.value)}
                  style={{ flex: 1, padding: "8px 10px", fontSize: "13px" }}
                  onKeyDown={e => {
                    if (e.key === "Enter" && nuevoVarianteNombre.trim()) {
                      setEditVariantes([...editVariantes, { nombre: nuevoVarianteNombre.trim(), opciones: [] }]);
                      setNuevoVarianteNombre("");
                    }
                  }} />
                <button style={{ background: "#111", color: "#ffd000", border: "none", borderRadius: "8px", padding: "8px 12px", fontWeight: "700", fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap" }}
                  onClick={() => {
                    if (!nuevoVarianteNombre.trim()) return;
                    setEditVariantes([...editVariantes, { nombre: nuevoVarianteNombre.trim(), opciones: [] }]);
                    setNuevoVarianteNombre("");
                  }}>+ Grupo</button>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={cerrarEdicion}>Cancelar</button>
              <button className="modal-btn-save" onClick={guardarEdicion}>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-left">
          <img src="/logo.svg" alt="Funtek" style={{ height: "52px", filter: "brightness(0) invert(1)" }} />
          <span className="admin-badge">Admin</span>
        </div>
        <div className="admin-header-right">
          <a href="/" className="admin-header-link"><IconStore /> Ver tienda</a>
          <button className="admin-logout-btn" onClick={() => { localStorage.removeItem("adminToken"); window.location.href = "/login-admin"; }}>
            <IconLogout /> Cerrar sesión
          </button>
        </div>
      </header>

      {/* TABS */}
      <div className="admin-tabs">
        <button className={`admin-tab ${tab === "pedidos" ? "active" : ""}`} onClick={() => setTab("pedidos")}>
          <IconPackage /> Pedidos
        </button>
        <button className={`admin-tab ${tab === "productos" ? "active" : ""}`} onClick={() => setTab("productos")}>
          <IconGrid /> Productos
        </button>
      </div>

      <div className="admin-content">

        {/* PEDIDOS */}
        {tab === "pedidos" && (
          <div>
            <h2 className="section-title">Pedidos</h2>
            <div className="stats-grid">
              {[
                { label: "Total pedidos", value: totalPedidos, dot: "#ddd" },
                { label: "Pendientes", value: pedidosPendientes, dot: "#f59e0b" },
                { label: "Pagados", value: pedidosPagados, dot: "#ffd000" },
                { label: "Enviados", value: pedidosEnviados, dot: "#60a5fa" },
                { label: "Entregados", value: pedidosEntregados, dot: "#34d399" },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <span className="stat-dot" style={{ background: s.dot }}></span>
                  <p className="stat-label">{s.label}</p>
                  <p className="stat-value">{s.value}</p>
                </div>
              ))}
              <div className="stat-card accent">
                <p className="stat-label">Facturado</p>
                <p className="stat-value">${totalFacturado.toLocaleString("es-AR")}</p>
              </div>
            </div>

            <div className="chart-card"><DashboardCharts pedidos={pedidos} /></div>

            <div className="filtros-row">
              {[{ label: "Todos", value: "todos" }, { label: "Pendientes", value: "pendiente" }, { label: "Pagados", value: "pagado" }, { label: "Enviados", value: "Enviado" }, { label: "Entregados", value: "Entregado" }].map(f => (
                <button key={f.value} className={`filtro-pill ${filtro === f.value ? "active" : ""}`} onClick={() => setFiltro(f.value)}>{f.label}</button>
              ))}
            </div>

            {pedidosFiltrados.length === 0 && (
              <div className="empty-state"><div className="empty-icon">📭</div><p className="empty-text">No hay pedidos en esta categoría</p></div>
            )}

            {pedidosFiltrados.map(pedido => {
              const total = pedido.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
              const { bg, color } = colorEstado(pedido.estado);
              const fecha = new Date(pedido.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
              return (
                <div key={pedido._id} className="pedido-card">
                  <div className="pedido-header">
                    <div>
                      <p className="pedido-nombre">{pedido.nombre}</p>
                      <p className="pedido-meta">{pedido.email}</p>
                      <p className="pedido-meta">{fecha} · #{pedido._id.slice(-6).toUpperCase()}</p>
                    </div>
                    <span className="estado-badge" style={{ background: bg, color }}>
                      {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                    </span>
                  </div>
                  {pedido.items.map((item, i) => (
                    <div key={i} className="pedido-item">
                      <span>{item.nombre} × {item.cantidad}</span>
                      <span style={{ fontWeight: "700" }}>${item.precio * item.cantidad}</span>
                    </div>
                  ))}
                  <div className="pedido-footer">
                    <span className="pedido-total">Total: ${total.toLocaleString("es-AR")}</span>
                    <div className="pedido-acciones">
                      {pedido.estado === "pagado" && (
                        <button className="btn-estado btn-enviado" onClick={() => cambiarEstado(pedido._id, "Enviado")}><IconTruck /> Marcar enviado</button>
                      )}
                      {pedido.estado === "Enviado" && (
                        <button className="btn-estado btn-entregado" onClick={() => cambiarEstado(pedido._id, "Entregado")}><IconCheck /> Marcar entregado</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PRODUCTOS */}
        {tab === "productos" && (
          <div>
            <h2 className="section-title">Gestión de Productos</h2>
            <div className="productos-layout">
              <div>
                <div className="panel-card">
                  <p className="panel-card-title"><IconPlus /> Nueva categoría</p>
                  <div className="admin-input-group">
                    <input className="admin-input" type="text" placeholder="Nombre de la categoría" value={nuevaCategoria} onChange={e => setNuevaCategoria(e.target.value)} />
                    <button className="btn-primary" onClick={crearCategoria}>Crear categoría</button>
                  </div>
                </div>
                <div className="panel-card">
                  <p className="panel-card-title"><IconPlus /> Nuevo producto</p>
                  <div className="admin-input-group">
                    <input className="admin-input" type="text" placeholder="Nombre del producto" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} />
                    <input className="admin-input" type="number" placeholder="Precio" value={nuevoPrecio} onChange={e => setNuevoPrecio(e.target.value)} />
                    <div>
                      <label style={{ fontSize: "12px", color: "#888", marginBottom: "6px", display: "block" }}>URLs de imágenes (una por línea)</label>
                      <textarea className="admin-input" placeholder={"https://url-imagen-1.jpg\nhttps://url-imagen-2.jpg"} value={nuevasImagenes.join("\n")}
                        onChange={e => setNuevasImagenes(e.target.value.split("\n"))}
                        style={{ resize: "vertical", minHeight: "75px", fontSize: "13px" }} />
                      {nuevasImagenes.find(u => u.trim()) && <img src={nuevasImagenes.find(u => u.trim())} alt="preview" style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "8px", background: "#f8f8f8", marginTop: "8px" }} />}
                    </div>
                    <input className="admin-input" type="text" placeholder="Marca (ej: Samsung, Apple)" value={nuevaMarca} onChange={e => setNuevaMarca(e.target.value)} />
                    <textarea className="admin-input" placeholder="Descripción (opcional)" value={nuevaDescripcion} onChange={e => setNuevaDescripcion(e.target.value)} style={{ resize: "vertical", minHeight: "75px" }} />
                    {nuevasVariantes.length === 0 && (
                      <input className="admin-input" type="number" min="0" placeholder="Stock (cantidad disponible)" value={nuevoStock} onChange={e => setNuevoStock(e.target.value)} />
                    )}
                    <div>
                      <label style={{ fontSize: "12px", color: "#888", marginBottom: "6px", display: "block" }}>Variantes (opcional)</label>
                      {nuevasVariantes.map((v, vi) => (
                        <div key={vi} style={{ background: "#f9f9f9", borderRadius: "10px", padding: "10px 12px", marginBottom: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <button className="btn-reorder" disabled={vi === 0} onClick={() => {
                                  const nv = [...nuevasVariantes];
                                  [nv[vi - 1], nv[vi]] = [nv[vi], nv[vi - 1]];
                                  setNuevasVariantes(nv);
                                }}><IconChevronUp /></button>
                                <button className="btn-reorder" disabled={vi === nuevasVariantes.length - 1} onClick={() => {
                                  const nv = [...nuevasVariantes];
                                  [nv[vi], nv[vi + 1]] = [nv[vi + 1], nv[vi]];
                                  setNuevasVariantes(nv);
                                }}><IconChevronDown /></button>
                              </div>
                              <span style={{ fontWeight: "600", fontSize: "13px" }}>{v.nombre}</span>
                            </div>
                            <button onClick={() => setNuevasVariantes(nuevasVariantes.filter((_, i) => i !== vi))}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: "12px", fontWeight: "700" }}>✕</button>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
                            {v.opciones.map((op, oi) => (
                              <div key={oi} style={{ display: "flex", alignItems: "center", gap: "6px", background: "white", borderRadius: "8px", padding: "6px 10px", border: "1px solid #eee" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                  <button className="btn-reorder" disabled={oi === 0} onClick={() => {
                                    const nv = [...nuevasVariantes];
                                    const ops = [...nv[vi].opciones];
                                    [ops[oi - 1], ops[oi]] = [ops[oi], ops[oi - 1]];
                                    nv[vi] = { ...nv[vi], opciones: ops };
                                    setNuevasVariantes(nv);
                                  }}><IconChevronUp /></button>
                                  <button className="btn-reorder" disabled={oi === v.opciones.length - 1} onClick={() => {
                                    const nv = [...nuevasVariantes];
                                    const ops = [...nv[vi].opciones];
                                    [ops[oi], ops[oi + 1]] = [ops[oi + 1], ops[oi]];
                                    nv[vi] = { ...nv[vi], opciones: ops };
                                    setNuevasVariantes(nv);
                                  }}><IconChevronDown /></button>
                                </div>
                                <span style={{ flex: 1, fontWeight: "600", fontSize: "13px" }}>{op.nombre}</span>
                                <span style={{ fontSize: "11px", color: "#aaa" }}>Stock:</span>
                                <input type="number" min="0" value={op.stock} onChange={e => {
                                  const nv = [...nuevasVariantes];
                                  nv[vi] = { ...nv[vi], opciones: nv[vi].opciones.map((o, i) => i === oi ? { ...o, stock: parseInt(e.target.value) || 0 } : o) };
                                  setNuevasVariantes(nv);
                                }} style={{ width: "60px", padding: "4px 8px", borderRadius: "6px", border: "1px solid #eee", fontSize: "13px", outline: "none" }} />
                                <button onClick={() => {
                                  const nv = [...nuevasVariantes];
                                  nv[vi] = { ...nv[vi], opciones: nv[vi].opciones.filter((_, i) => i !== oi) };
                                  setNuevasVariantes(nv);
                                }} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: "14px", padding: 0 }}>✕</button>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <input placeholder="Nueva opción (ej: Blanco)" className="admin-input" style={{ flex: 1, padding: "6px 10px", fontSize: "12px" }}
                              onKeyDown={e => {
                                if (e.key === "Enter" && e.target.value.trim()) {
                                  const nv = [...nuevasVariantes]; nv[vi] = { ...nv[vi], opciones: [...nv[vi].opciones, { nombre: e.target.value.trim(), stock: 0 }] };
                                  setNuevasVariantes(nv); e.target.value = "";
                                }
                              }} />
                            <button style={{ background: "#ffd000", border: "none", borderRadius: "8px", padding: "6px 10px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}
                              onClick={e => {
                                const input = e.target.previousSibling;
                                if (!input.value.trim()) return;
                                const nv = [...nuevasVariantes]; nv[vi] = { ...nv[vi], opciones: [...nv[vi].opciones, { nombre: input.value.trim(), stock: 0 }] };
                                setNuevasVariantes(nv); input.value = "";
                              }}>+ Agregar</button>
                          </div>
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: "6px" }}>
                        <input className="admin-input" placeholder="Nuevo grupo (ej: Color)" value={nuevoVarianteNombreForm} onChange={e => setNuevoVarianteNombreForm(e.target.value)}
                          style={{ flex: 1, padding: "8px 10px", fontSize: "13px" }}
                          onKeyDown={e => {
                            if (e.key === "Enter" && nuevoVarianteNombreForm.trim()) {
                              setNuevasVariantes([...nuevasVariantes, { nombre: nuevoVarianteNombreForm.trim(), opciones: [] }]);
                              setNuevoVarianteNombreForm("");
                            }
                          }} />
                        <button style={{ background: "#111", color: "#ffd000", border: "none", borderRadius: "8px", padding: "8px 12px", fontWeight: "700", fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap" }}
                          onClick={() => {
                            if (!nuevoVarianteNombreForm.trim()) return;
                            setNuevasVariantes([...nuevasVariantes, { nombre: nuevoVarianteNombreForm.trim(), opciones: [] }]);
                            setNuevoVarianteNombreForm("");
                          }}>+ Grupo</button>
                      </div>
                    </div>
                    <select className="admin-input" value={categoriaSeleccionada} onChange={e => setCategoriaSeleccionada(e.target.value)}>
                      {Object.keys(listaProductos).map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                    <button className="btn-secondary" onClick={agregarProducto}>Agregar producto</button>
                  </div>
                </div>
              </div>

              <div>
                {Object.entries(listaProductos).map(([cat, items]) => (
                  <div key={cat} className="panel-card">
                    <div className="cat-header">
                      <h3 className="cat-title">{cat.charAt(0).toUpperCase() + cat.slice(1)}<span className="cat-count">{items.length}</span></h3>
                      <button className="btn-del-cat" onClick={() => eliminarCategoria(cat)}>Eliminar</button>
                    </div>
                    {items.length === 0 && <p style={{ color: "#bbb", fontSize: "13px", textAlign: "center", padding: "16px 0", margin: 0 }}>Sin productos</p>}
                    {items.map(producto => (
                      <div key={producto.id} className="producto-row">
                        <img src={producto.imagen} alt={producto.nombre} className="producto-thumb" />
                        <div className="producto-info">
                          <p className="producto-nombre">{producto.nombre}</p>
                          <p className="producto-precio">${producto.precio}{producto.marca ? ` · ${producto.marca}` : ""}</p>
                        </div>
                        <button className="btn-edit" onClick={() => abrirEdicion(cat, producto)} title="Editar"><IconEdit /></button>
                        <button className="btn-del" onClick={() => eliminarProducto(cat, producto.id)} title="Eliminar"><IconTrash /></button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminPanel;
