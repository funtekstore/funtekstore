import { useState } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .auth-wrap { min-height: 100vh; display: flex; font-family: 'DM Sans', sans-serif; }

  /* LADO IZQUIERDO — todo negro con patrón de puntos */
  .auth-left {
    width: 45%; background: #0a0a0a;
    display: flex; flex-direction: column;
    justify-content: space-between; padding: 48px;
    position: relative; overflow: hidden;
    background-image: radial-gradient(rgba(255,208,0,0.08) 1px, transparent 1px);
    background-size: 28px 28px;
  }
  .auth-left::before {
    content: ''; position: absolute; bottom: -60px; right: -60px;
    width: 300px; height: 300px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,208,0,0.12), transparent 70%);
    pointer-events: none;
  }
  .auth-left-logo img { height: 44px; filter: brightness(0) invert(1); }
  .auth-left-content { z-index: 1; }
  .auth-left-tag {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(255,208,0,0.1); color: #ffd000; border: 1px solid rgba(255,208,0,0.2);
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; padding: 6px 14px; border-radius: 20px; margin-bottom: 24px;
  }
  .auth-left-tag::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #ffd000; }
  .auth-left-title {
    font-family: 'DM Serif Display', serif; font-size: 38px; font-weight: 400;
    color: white; line-height: 1.25; margin-bottom: 20px;
  }
  .auth-left-title em { color: #ffd000; font-style: italic; }
  .auth-left-desc { color: rgba(255,255,255,0.35); font-size: 14px; line-height: 1.7; max-width: 280px; }
  .auth-left-footer { color: rgba(255,255,255,0.15); font-size: 12px; z-index: 1; }

  /* LADO DERECHO — gris muy oscuro */
  .auth-right {
    flex: 1; background: #141414;
    display: flex; align-items: center; justify-content: center; padding: 48px 40px;
  }

  .auth-form { width: 100%; max-width: 380px; animation: fadeUp 0.4s ease; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .auth-form-title { font-size: 26px; font-weight: 700; color: white; margin-bottom: 6px; }
  .auth-form-sub { font-size: 14px; color: #555; margin-bottom: 36px; }

  .auth-field { margin-bottom: 16px; }
  .auth-label {
    display: block; font-size: 11px; font-weight: 700; color: #555;
    text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 7px;
  }
  .auth-input {
    width: 100%; padding: 13px 16px; border-radius: 12px;
    border: 1.5px solid #2a2a2a; font-size: 14px; font-family: 'DM Sans', sans-serif;
    outline: none; background: #1e1e1e; color: white;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .auth-input::placeholder { color: #444; }
  .auth-input:focus { border-color: #ffd000; box-shadow: 0 0 0 3px rgba(255,208,0,0.08); }

  .auth-btn {
    width: 100%; padding: 14px; background: #ffd000; color: #111; border: none;
    border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer;
    font-family: 'DM Sans', sans-serif; margin-top: 8px;
    transition: opacity 0.2s, transform 0.15s;
  }
  .auth-btn:hover { opacity: 0.88; transform: translateY(-1px); }

  .auth-error {
    background: rgba(220,38,38,0.1); color: #f87171; border-radius: 10px;
    padding: 12px 16px; font-size: 13px; font-weight: 500;
    margin-bottom: 16px; border: 1px solid rgba(220,38,38,0.2);
  }

  .auth-links { margin-top: 28px; text-align: center; }
  .auth-back { font-size: 13px; color: #444; text-decoration: none; transition: color 0.2s; }
  .auth-back:hover { color: #666; }

  @media (max-width: 768px) {
    .auth-left { display: none; }
    .auth-right { background: #0a0a0a; padding: 40px 24px; }
  }
`;

function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return setError("Completá todos los campos");
    setError("");
    setCargando(true);
    try {
      const response = await fetch("https://funtechstore-production.up.railway.app/login-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("adminToken", data.token);
        window.location.href = "/admin";
      } else {
        setError(data.message || "Credenciales incorrectas");
      }
    } catch {
      setError("Error de conexión");
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
          <span className="auth-left-tag">Acceso restringido</span>
          <h2 className="auth-left-title">Panel de<br /><em>administración</em></h2>
          <p className="auth-left-desc">Gestioná pedidos, productos y clientes desde un solo lugar. Solo para administradores.</p>
        </div>
        <div className="auth-left-footer">© 2026 Funtek Store</div>
      </div>

      {/* DERECHA */}
      <div className="auth-right">
        <div className="auth-form">
          <h1 className="auth-form-title">Iniciar sesión</h1>
          <p className="auth-form-sub">Ingresá tus credenciales de administrador</p>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input className="auth-input" type="email" placeholder="admin@email.com" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>
          <div className="auth-field">
            <label className="auth-label">Contraseña</label>
            <input className="auth-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>

          <button className="auth-btn" onClick={handleLogin} disabled={cargando}>
            {cargando ? "Verificando..." : "Ingresar al panel"}
          </button>

          <div className="auth-links">
            <a href="/" className="auth-back">← Volver a la tienda</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginAdmin;
