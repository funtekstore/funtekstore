import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function PagoExitoso() {
  const navigate = useNavigate();

  useEffect(() => {
    // Disparar evento storage para que App.jsx limpie el carrito en memoria
    localStorage.removeItem("carrito");
    window.dispatchEvent(new StorageEvent("storage", { key: "carrito", newValue: null }));
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: "#f9f9f9",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", padding: "20px"
    }}>
      <div style={{
        background: "white", borderRadius: "24px", padding: "60px 50px",
        textAlign: "center", maxWidth: "460px", width: "100%",
        boxShadow: "0 8px 40px rgba(0,0,0,0.08)"
      }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: "#f0fdf4", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 24px"
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111", margin: "0 0 12px" }}>
          ¡Pago aprobado!
        </h1>
        <p style={{ color: "#888", fontSize: "15px", lineHeight: 1.6, margin: "0 0 36px" }}>
          Gracias por tu compra en Funtek. Te enviamos un email con los detalles del pedido.
        </p>

        <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
          <button onClick={() => navigate("/perfil")} style={{
            background: "#111", color: "#ffd000", border: "none",
            padding: "14px", borderRadius: "12px", fontWeight: "700",
            fontSize: "15px", cursor: "pointer", fontFamily: "inherit"
          }}>
            Ver mis pedidos
          </button>
          <button onClick={() => navigate("/")} style={{
            background: "none", color: "#888", border: "1.5px solid #eee",
            padding: "13px", borderRadius: "12px", fontWeight: "600",
            fontSize: "14px", cursor: "pointer", fontFamily: "inherit"
          }}>
            Volver a la tienda
          </button>
        </div>
      </div>
    </div>
  );
}

export default PagoExitoso;
