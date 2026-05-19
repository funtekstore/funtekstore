import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .auth-wrap { min-height: 100vh; display: flex; font-family: 'DM Sans', sans-serif; }

  .auth-left {
    width: 45%; background: #111; display: flex; flex-direction: column;
    justify-content: space-between; padding: 48px; position: relative; overflow: hidden;
  }
  .auth-left::before {
    content: ''; position: absolute; top: -120px; right: -120px;
    width: 380px; height: 380px; border-radius: 50%;
    border: 60px solid rgba(255,208,0,0.07); pointer-events: none;
  }
  .auth-left::after {
    content: ''; position: absolute; bottom: -80px; left: -80px;
    width: 280px; height: 280px; border-radius: 50%;
    border: 40px solid rgba(255,208,0,0.05); pointer-events: none;
  }
  .auth-left-logo img { height: 44px; filter: brightness(0) invert(1); }
  .auth-left-content { z-index: 1; }
  .auth-left-tag {
    display: inline-block; background: #ffd000; color: #111;
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; padding: 5px 14px; border-radius: 20px; margin-bottom: 24px;
  }
  .auth-left-title {
    font-family: 'DM Serif Display', serif; font-size: 42px; font-weight: 400;
    color: white; line-height: 1.2; margin-bottom: 20px;
  }
  .auth-left-title em { color: #ffd000; font-style: italic; }
  .auth-left-desc { color: rgba(255,255,255,0.45); font-size: 15px; line-height: 1.7; max-width: 300px; }
  .auth-left-footer { color: rgba(255,255,255,0.2); font-size: 12px; z-index: 1; }

  .auth-right {
    flex: 1; background: #fafafa; display: flex;
    align-items: center; justify-content: center; padding: 48px 40px;
  }
  .auth-form { width: 100%; max-width: 380px; animation: fadeUp 0.4s ease; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .auth-form-title { font-size: 26px; font-weight: 700; color: #111; margin-bottom: 6px; }
  .auth-form-sub { font-size: 14px; color: #999; margin-bottom: 36px; }
  .auth-field { margin-bottom: 16px; }
  .auth-label {
    display: block; font-size: 12px; font-weight: 700; color: #888;
    text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 7px;
  }
  .auth-input {
    width: 100%; padding: 13px 16px; border-radius: 12px; border: 1.5px solid #e8e8e8;
    font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none;
    background: white; color: #111; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .auth-input:focus { border-color: #111; box-shadow: 0 0 0 3px rgba(0,0,0,0.06); }
  .auth-btn {
    width: 100%; padding: 14px; background: #ffd000; color: #111; border: none;
    border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer;
    font-family: 'DM Sans', sans-serif; margin-top: 8px; transition: opacity 0.2s, transform 0.15s;
  }
  .auth-btn:hover { opacity: 0.88; transform: translateY(-1px); }
  .auth-error {
    background: #fef2f2; color: #dc2626; border-radius: 10px;
    padding: 12px 16px; font-size: 13px; font-weight: 500;
    margin-bottom: 16px; border: 1px solid #fecaca;
  }
  .auth-success {
    background: #f0fdf4; color: #15803d; border-radius: 10px;
    padding: 12px 16px; font-size: 13px; font-weight: 500;
    margin-bottom: 16px; border: 1px solid #bbf7d0;
  }
  .auth-links { margin-top: 28px; display: flex; flex-direction: column; gap: 10px; text-align: center; }
  .auth-links p { font-size: 14px; color: #666; }
  .auth-links a { color: #111; font-weight: 700; text-decoration: none; }
  .auth-links a:hover { text-decoration: underline; }
  .auth-back { font-size: 13px; color: #bbb !important; font-weight: 400 !important; }
  .auth-divider { height: 1px; background: #eee; margin: 20px 0; }

  @media (max-width: 768px) {
    .auth-left { display: none; }
    .auth-right { padding: 40px 24px; background: white; }
  }
`;

function RegisterCliente() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback
      });
      window.google?.accounts.id.renderButton(
        document.getElementById("google-btn-reg"),
        { theme: "outline", size: "large", width: 380, text: "signup_with", shape: "rectangular" }
      );
    };
    return () => document.body.removeChild(script);
  }, []);

  const handleGoogleCallback = async (response) => {
    setError(""); setCargando(true);
    try {
      const res = await fetch("https://funtechstore-production.up.railway.app/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("clienteToken", data.token);
        localStorage.setItem("clienteEmail", data.email);
        localStorage.setItem("clienteNombre", data.nombre);
        window.location.href = "/";
      } else {
        setError(data.message || "Error al registrarse con Google");
      }
    } catch { setError("Error de conexión"); }
    finally { setCargando(false); }
  };

  const handleRegister = async () => {
    if (!nombre || !email || !password || !confirmarPassword) return setError("Completá todos los campos");
    if (password !== confirmarPassword) return setError("Las contraseñas no coinciden");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");
    setError("");
    setCargando(true);
    try {
      const response = await fetch("https://funtechstore-production.up.railway.app/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password })
      });
      const data = await response.json();
      if (response.ok) {
        setExito(true);
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(data.message || "Error al registrarse");
      }
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-wrap">
      <style>{css}</style>

      {/* IZQUIERDA */}
      <div className="auth-left">
        <div className="auth-left-logo">
          <img src="/logo.svg" alt="Funtek" />
        </div>
        <div className="auth-left-content">
          <span className="auth-left-tag">Nuevo por acá</span>
          <h2 className="auth-left-title">Unite a la<br />comunidad <em>Funtek</em></h2>
          <p className="auth-left-desc">Creá tu cuenta gratis y accedé a tu historial de pedidos, seguimiento y mucho más.</p>
        </div>
        <div className="auth-left-footer">© 2026 Funtek Store</div>
      </div>

      {/* DERECHA */}
      <div className="auth-right">
        <div className="auth-form">
          <h1 className="auth-form-title">Crear cuenta</h1>
          <p className="auth-form-sub">Completá tus datos para registrarte</p>

          {error && <div className="auth-error">{error}</div>}
          {exito && <div className="auth-success">¡Cuenta creada! Redirigiendo...</div>}

          <div className="auth-field">
            <label className="auth-label">Nombre</label>
            <input className="auth-input" type="text" placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
          </div>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input className="auth-input" type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="auth-field">
            <label className="auth-label">Contraseña</label>
            <input className="auth-input" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="auth-field">
            <label className="auth-label">Confirmar contraseña</label>
            <input className="auth-input" type="password" placeholder="Repetí tu contraseña" value={confirmarPassword} onChange={e => setConfirmarPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleRegister()} />
          </div>

          <button className="auth-btn" onClick={handleRegister} disabled={cargando}>
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <div style={{ margin: "20px 0 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "#eee" }} />
              <span style={{ fontSize: "12px", color: "#bbb", fontWeight: "600", whiteSpace: "nowrap" }}>O registrate con</span>
              <div style={{ flex: 1, height: "1px", background: "#eee" }} />
            </div>
            <div id="google-btn-reg" style={{ display: "flex", justifyContent: "center" }} />
          </div>

          <div className="auth-links">
            <p>¿Ya tenés cuenta? <a href="/login">Iniciá sesión</a></p>
            <div className="auth-divider"/>
            <a href="/" className="auth-back">← Volver a la tienda</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterCliente;
