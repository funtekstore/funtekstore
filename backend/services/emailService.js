import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const emailBase = (contenido) => `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 40px 20px;">
    <div style="background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07);">

      <!-- HEADER -->
      <div style="background: #111; padding: 32px 40px; text-align: center;">
        <h1 style="font-size: 30px; color: white; margin: 0; letter-spacing: -0.5px;">Funtek</h1>
        <div style="background: #ffd000; height: 3px; width: 48px; margin: 10px auto 0; border-radius: 2px;"></div>
      </div>

      <!-- CONTENIDO -->
      <div style="padding: 40px;">
        ${contenido}
      </div>

      <!-- FOOTER -->
      <div style="border-top: 1px solid #f0f0f0; padding: 24px 40px; text-align: center;">
        <p style="margin: 0; color: #bbb; font-size: 12px; letter-spacing: 0.3px;">Funtek · Accesorios premium para tu celular</p>
      </div>

    </div>
  </div>
`;

const itemsTabla = (items, total) => `
  <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
    ${items.map(item => `
      <tr>
        <td style="padding: 11px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #444;">
          ${item.nombre} <span style="color: #aaa;">× ${item.cantidad}</span>
        </td>
        <td style="padding: 11px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; font-weight: 700; text-align: right; color: #111;">
          $${item.precio * item.cantidad}
        </td>
      </tr>
    `).join("")}
    <tr>
      <td style="padding: 16px 0 0; font-weight: 700; font-size: 16px; color: #111;">Total</td>
      <td style="padding: 16px 0 0; font-weight: 700; font-size: 18px; text-align: right; color: #111;">$${total}</td>
    </tr>
  </table>
`;

const badge = (texto, bg, color) => `
  <div style="display: inline-block; background: ${bg}; color: ${color}; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
    ${texto}
  </div>
`;

// ─── CONFIRMACIÓN ────────────────────────────────────────────────────────────

export const enviarEmailConfirmacion = async (email, nombre, items, total, metodoPago = "mercadopago") => {

  const instrucciones = {
    mercadopago: `
      <div style="background: #f9f9f9; border-radius: 12px; padding: 20px 24px; margin-top: 28px;">
        <p style="margin: 0 0 6px; font-weight: 700; font-size: 14px; color: #111;">Pago con MercadoPago</p>
        <p style="margin: 0; font-size: 13px; color: #888; line-height: 1.6;">Tu pago está siendo procesado. Te notificaremos cuando sea confirmado.</p>
      </div>
    `,
    tarjeta: `
      <div style="background: #f9f9f9; border-radius: 12px; padding: 20px 24px; margin-top: 28px;">
        <p style="margin: 0 0 6px; font-weight: 700; font-size: 14px; color: #111;">Pago con tarjeta</p>
        <p style="margin: 0; font-size: 13px; color: #888; line-height: 1.6;">Tu pago con tarjeta está siendo procesado por MercadoPago. Te avisamos cuando se confirme.</p>
      </div>
    `,
    transferencia: `
      <div style="background: #fffbe6; border: 1px solid #ffd000; border-radius: 12px; padding: 20px 24px; margin-top: 28px;">
        <p style="margin: 0 0 10px; font-weight: 700; font-size: 14px; color: #111;">Datos para la transferencia</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="font-size: 13px; color: #888; padding: 4px 0; width: 80px;">Alias</td>
            <td style="font-size: 13px; font-weight: 700; color: #111; padding: 4px 0;">funtek.store</td>
          </tr>
          <tr>
            <td style="font-size: 13px; color: #888; padding: 4px 0;">CBU</td>
            <td style="font-size: 13px; font-weight: 700; color: #111; padding: 4px 0;">0000000000000000000000</td>
          </tr>
          <tr>
            <td style="font-size: 13px; color: #888; padding: 4px 0;">Banco</td>
            <td style="font-size: 13px; font-weight: 700; color: #111; padding: 4px 0;">Mercado Pago</td>
          </tr>
          <tr>
            <td style="font-size: 13px; color: #888; padding: 4px 0;">Monto</td>
            <td style="font-size: 13px; font-weight: 700; color: #111; padding: 4px 0;">$${total}</td>
          </tr>
        </table>
        <p style="margin: 14px 0 0; font-size: 12px; color: #aaa; line-height: 1.5;">Una vez realizada la transferencia, envianos el comprobante por Instagram o WhatsApp y confirmamos tu pedido.</p>
      </div>
    `,
    efectivo: `
      <div style="background: #f9f9f9; border-radius: 12px; padding: 20px 24px; margin-top: 28px;">
        <p style="margin: 0 0 6px; font-weight: 700; font-size: 14px; color: #111;">Pago en efectivo</p>
        <p style="margin: 0; font-size: 13px; color: #888; line-height: 1.6;">Recibimos tu pedido. Coordiná el encuentro con nosotros por WhatsApp para acordar el lugar y horario de entrega.</p>
      </div>
    `
  };

  const metodosLabel = {
    mercadopago: "MercadoPago",
    tarjeta: "Tarjeta",
    transferencia: "Transferencia bancaria",
    efectivo: "Efectivo"
  };

  await resend.emails.send({
    from: "Funtek <onboarding@resend.dev>",
    to: email,
    subject: "Confirmación de pedido — Funtek",
    html: emailBase(`
      <p style="font-size: 13px; color: #aaa; margin: 0 0 16px;">
        ${badge("Pedido recibido", "#f4f4f4", "#555")}
      </p>
      <h2 style="font-size: 22px; color: #111; margin: 0 0 8px; font-weight: 700;">Gracias, ${nombre}.</h2>
      <p style="color: #888; font-size: 14px; margin: 0 0 28px; line-height: 1.6;">Tu pedido fue registrado correctamente. A continuación encontrás el detalle y las instrucciones de pago.</p>

      <p style="font-size: 12px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 4px;">Método de pago</p>
      <p style="font-size: 14px; font-weight: 700; color: #111; margin: 0 0 20px;">${metodosLabel[metodoPago] || "MercadoPago"}</p>

      <p style="font-size: 12px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 4px;">Resumen del pedido</p>
      ${itemsTabla(items, total)}

      ${instrucciones[metodoPago] || instrucciones.mercadopago}
    `)
  });
};

// ─── ENVIADO ─────────────────────────────────────────────────────────────────

export const enviarEmailEnviado = async (email, nombre) => {
  await resend.emails.send({
    from: "Funtek <onboarding@resend.dev>",
    to: email,
    subject: "Tu pedido está en camino — Funtek",
    html: emailBase(`
      <p style="font-size: 13px; color: #aaa; margin: 0 0 16px;">
        ${badge("En camino", "#cce5ff", "#004085")}
      </p>
      <h2 style="font-size: 22px; color: #111; margin: 0 0 8px; font-weight: 700;">Tu pedido está en camino, ${nombre}.</h2>
      <p style="color: #888; font-size: 14px; margin: 0 0 28px; line-height: 1.6;">Tu pedido fue despachado y está en camino hacia vos. En breve lo recibirás.</p>

      <div style="background: #f9f9f9; border-left: 4px solid #ffd000; border-radius: 0 12px 12px 0; padding: 18px 20px;">
        <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.6;">Si tenés alguna consulta sobre la entrega, escribinos por Instagram o WhatsApp.</p>
      </div>
    `)
  });
};

// ─── ENTREGADO ────────────────────────────────────────────────────────────────

export const enviarEmailEntregado = async (email, nombre) => {
  await resend.emails.send({
    from: "Funtek <onboarding@resend.dev>",
    to: email,
    subject: "Pedido entregado — Funtek",
    html: emailBase(`
      <p style="font-size: 13px; color: #aaa; margin: 0 0 16px;">
        ${badge("Entregado", "#d4edda", "#155724")}
      </p>
      <h2 style="font-size: 22px; color: #111; margin: 0 0 8px; font-weight: 700;">Pedido entregado, ${nombre}.</h2>
      <p style="color: #888; font-size: 14px; margin: 0 0 28px; line-height: 1.6;">Tu pedido fue entregado exitosamente. Esperamos que lo disfrutes.</p>

      <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; text-align: center;">
        <p style="margin: 0 0 18px; font-size: 14px; color: #555;">¿Te gustó tu compra? Dejanos una reseña en la tienda.</p>
        <a href="http://localhost:5173" style="background: #111; color: #ffd000; padding: 13px 32px; border-radius: 30px; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 0.3px;">
          Ir a la tienda
        </a>
      </div>
    `)
  });
};

// ─── CONTACTO ─────────────────────────────────────────────────────────────────

export async function enviarEmailContacto(nombre, emailRemitente, mensaje) {
  await resend.emails.send({
    from: "Funtek Store <onboarding@resend.dev>",
    to: "funtekstore@gmail.com",
    subject: `Nuevo mensaje de ${nombre} — Funtek`,
    html: emailBase(`
      <p style="font-size: 13px; color: #aaa; margin: 0 0 16px;">
        ${badge("Consulta entrante", "#f4f4f4", "#555")}
      </p>
      <h2 style="font-size: 20px; color: #111; margin: 0 0 24px; font-weight: 700;">Nuevo mensaje de contacto</h2>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="font-size: 12px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0 4px; width: 80px;">Nombre</td>
          <td style="font-size: 14px; color: #111; font-weight: 600; padding: 8px 0 4px;">${nombre}</td>
        </tr>
        <tr>
          <td style="font-size: 12px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 0;">Email</td>
          <td style="font-size: 14px; color: #111; padding: 4px 0;"><a href="mailto:${emailRemitente}" style="color: #111; text-decoration: none;">${emailRemitente}</a></td>
        </tr>
      </table>

      <div style="background: #f9f9f9; border-radius: 12px; padding: 20px 24px; margin-top: 24px;">
        <p style="font-size: 12px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px;">Mensaje</p>
        <p style="font-size: 14px; color: #444; line-height: 1.7; margin: 0;">${mensaje}</p>
      </div>
    `)
  });
}

// ─── BIENVENIDA ───────────────────────────────────────────────────────────────

export const enviarEmailBienvenida = async (email, nombre) => {
  await resend.emails.send({
    from: "Funtek <onboarding@resend.dev>",
    to: email,
    subject: "¡Bienvenido a Funtek! 🎉",
    html: emailBase(`
      <p style="font-size: 13px; color: #aaa; margin: 0 0 16px;">
        ${badge("Cuenta creada", "#f0fdf4", "#15803d")}
      </p>
      <h2 style="font-size: 22px; color: #111; margin: 0 0 8px; font-weight: 700;">¡Bienvenido, ${nombre}!</h2>
      <p style="color: #888; font-size: 14px; margin: 0 0 28px; line-height: 1.6;">Tu cuenta fue creada correctamente. Ya podés explorar nuestro catálogo y hacer tu primera compra.</p>

      <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <p style="margin: 0 0 18px; font-size: 14px; color: #555; line-height: 1.6;">Accesorios premium para tu celular, con los mejores precios y envíos a todo el país.</p>
        <a href="http://localhost:5173" style="background: #ffd000; color: #111; padding: 13px 32px; border-radius: 30px; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 0.3px;">
          Ver productos
        </a>
      </div>

      <div style="border-top: 1px solid #f0f0f0; padding-top: 20px;">
        <p style="font-size: 13px; color: #aaa; margin: 0; text-align: center;">¿Tenés alguna consulta? Escribinos por <a href="https://wa.me/5493412682820" style="color: #111; font-weight: 700; text-decoration: none;">WhatsApp</a> o <a href="https://instagram.com/fun.tech.store" style="color: #111; font-weight: 700; text-decoration: none;">Instagram</a></p>
      </div>
    `)
  });
};

// ─── RESET DE CONTRASEÑA ──────────────────────────────────────────────────────

export const enviarEmailResetPassword = async (email, nombre, token) => {
  const link = `http://localhost:5173/reset-password?token=${token}`;
  await resend.emails.send({
    from: "Funtek <onboarding@resend.dev>",
    to: email,
    subject: "Restablecer contraseña — Funtek",
    html: emailBase(`
      <p style="font-size: 13px; color: #aaa; margin: 0 0 16px;">
        ${badge("Seguridad", "#f4f4f4", "#555")}
      </p>
      <h2 style="font-size: 22px; color: #111; margin: 0 0 8px; font-weight: 700;">Restablecer contraseña</h2>
      <p style="color: #888; font-size: 14px; margin: 0 0 28px; line-height: 1.6;">Hola ${nombre}, recibimos una solicitud para restablecer la contraseña de tu cuenta. Si no fuiste vos, ignorá este email.</p>

      <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <p style="margin: 0 0 18px; font-size: 14px; color: #555;">Este link es válido por 1 hora.</p>
        <a href="${link}" style="background: #111; color: #ffd000; padding: 13px 32px; border-radius: 30px; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 0.3px;">
          Restablecer contraseña
        </a>
      </div>

      <div style="border-top: 1px solid #f0f0f0; padding-top: 20px;">
        <p style="font-size: 12px; color: #bbb; margin: 0; text-align: center; line-height: 1.6;">Si el botón no funciona, copiá este link: <br/><span style="color: #888; word-break: break-all;">${link}</span></p>
      </div>
    `)
  });
};
