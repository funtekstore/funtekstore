import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .auth-form-title { font-size: 26px; font-weight: 700; color: #111; margin-bottom: 6px; }
  .auth-form-sub { font-size: 14px; color: #999; margin-bottom: 36px; }
  .auth-field { margin-bottom: 16px; }
  .auth-label { display: block; font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 7px; }
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
  .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .auth-error { background: #fef2f2; color: #dc2626; border-radius: 10px; padding: 12px 16px; font-size: 13px; font-weight: 500; margin-bottom: 16px; border: 1px solid #fecaca; }
  .auth-success { background: #f0fdf4; color: #15803d; border-radius: 10px; padding: 12px 16px; font-size: 13px; font-weight: 500; margin-bottom: 16px; border: 1px solid #bbf7d0; }
  .auth-links { margin-top: 28px; display: flex; flex-direction: column; gap: 10px; text-align: center; }
  .auth-links p { font-size: 14px; color: #666; }
  .auth-links a { color: #111; font-weight: 700; text-decoration: none; }
  .auth-links a:hover { text-decoration: underline; }
  .auth-back { font-size: 13px; color: #bbb !important; font-weight: 400 !important; }
  @media (max-width: 768px) {
    .auth-left { display: none; }
    .auth-right { padding: 40px 24px; background: white; }
  }
`;

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  // Vista solicitar reset (sin token)
  const [emailSolicitud, setEmailSolicitud] = useState("");
  const [enviado, setEnviado] = useState(false);

  // Vista nueva contraseña (con token)
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [exito, setExito] = useState(false);

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSolicitar = async () => {
    if (!emailSolicitud) return setError("Ingresá tu email");
    setError(""); setCargando(true);
    try {
      await fetch("https://funtechstore-production.up.railway.app/reset-password/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailSolicitud })
      });
      setEnviado(true);
    } catch { setError("Error de conexión"); }
    finally { setCargando(false); }
  };

  const handleConfirmar = async () => {
    if (!nuevaPassword || !confirmarPassword) return setError("Completá todos los campos");
    if (nuevaPassword !== confirmarPassword) return setError("Las contraseñas no coinciden");
    if (nuevaPassword.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");
    setError(""); setCargando(true);
    try {
      const res = await fetch("https://funtechstore-production.up.railway.app/reset-password/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: nuevaPassword })
      });
      const data = await res.json();
      if (res.ok) { setExito(true); setTimeout(() => navigate("/login"), 2500); }
      else { setError(data.message || "Error al restablecer la contraseña"); }
    } catch { setError("Error de conexión"); }
    finally { setCargando(false); }
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
          <span className="auth-left-tag">Seguridad</span>
          <h2 className="auth-left-title">Recuperá tu<br /><em>contraseña</em></h2>
          <p className="auth-left-desc">Te enviamos un link seguro para que puedas crear una nueva contraseña.</p>
        </div>
        <div className="auth-left-footer">© 2026 Funtek Store</div>
      </div>

      {/* DERECHA */}
      <div className="auth-right">
        <div className="auth-form">

          {/* SIN TOKEN — solicitar reset */}
          {!token && !enviado && (
            <>
              <h1 className="auth-form-title">Olvidé mi contraseña</h1>
              <p className="auth-form-sub">Ingresá tu email y te enviamos un link para restablecerla</p>
              {error && <div className="auth-error">{error}</div>}
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <input className="auth-input" type="email" placeholder="tu@email.com"
                  value={emailSolicitud} onChange={e => setEmailSolicitud(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSolicitar()} />
              </div>
              <button className="auth-btn" onClick={handleSolicitar} disabled={cargando}>
                {cargando ? "Enviando..." : "Enviar link de recuperación"}
              </button>
              <div className="auth-links">
                <p>¿Te acordaste? <a href="/login">Iniciá sesión</a></p>
                <a href="/" className="auth-back">← Volver a la tienda</a>
              </div>
            </>
          )}

          {/* EMAIL ENVIADO */}
          {!token && enviado && (
            <>
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h1 className="auth-form-title" style={{ textAlign: "center" }}>Email enviado</h1>
                <p style={{ color: "#888", fontSize: "14px", marginTop: "8px", lineHeight: 1.6 }}>
                  Si el email está registrado, vas a recibir un link para restablecer tu contraseña. Revisá tu bandeja de entrada.
                </p>
              </div>
              <div className="auth-links">
                <a href="/login">← Volver al inicio de sesión</a>
              </div>
            </>
          )}

          {/* CON TOKEN — nueva contraseña */}
          {token && !exito && (
            <>
              <h1 className="auth-form-title">Nueva contraseña</h1>
              <p className="auth-form-sub">Elegí una contraseña segura para tu cuenta</p>
              {error && <div className="auth-error">{error}</div>}
              <div className="auth-field">
                <label className="auth-label">Nueva contraseña</label>
                <input className="auth-input" type="password" placeholder="Mínimo 6 caracteres"
                  value={nuevaPassword} onChange={e => setNuevaPassword(e.target.value)} />
              </div>
              <div className="auth-field">
                <label className="auth-label">Confirmar contraseña</label>
                <input className="auth-input" type="password" placeholder="Repetí tu contraseña"
                  value={confirmarPassword} onChange={e => setConfirmarPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleConfirmar()} />
              </div>
              <button className="auth-btn" onClick={handleConfirmar} disabled={cargando}>
                {cargando ? "Guardando..." : "Guardar nueva contraseña"}
              </button>
            </>
          )}

          {/* ÉXITO */}
          {token && exito && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h1 className="auth-form-title" style={{ textAlign: "center" }}>Contraseña actualizada</h1>
              <p style={{ color: "#888", fontSize: "14px", marginTop: "8px" }}>Redirigiendo al inicio de sesión...</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
