import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import { MercadoPagoConfig, Preference } from "mercadopago";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "./models/User.js";
import Pedido from "./models/Pedido.js";
import fetch from "node-fetch";
import { isAdmin } from "./middleware/isAdmin.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Resena from "./models/Resena.js";
import Producto from "./models/Producto.js";
import productosIniciales from "./data/productos.js";
import { enviarEmailConfirmacion, enviarEmailEnviado, enviarEmailEntregado, enviarEmailContacto, enviarEmailBienvenida, enviarEmailResetPassword } from "./services/emailService.js";

// Verificar token
function verificarToken(req, res, next) {

  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Token requerido" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido" });
    }

    req.user = user;
    next();
  });
}


// Verificar si es admin
async function esAdmin(req, res, next) {
  try {

    const user = await User.findById(req.user.id);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Acceso solo para admins" });
    }

    next();

  } catch (error) {
    res.status(500).json({ message: "Error al verificar admin" });
  }
}

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configurar MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB conectado");
    // Sembrar productos iniciales si la colección está vacía
    const count = await Producto.countDocuments();
    if (count === 0) {
      const docs = Object.entries(productosIniciales).flatMap(([categoria, items]) =>
        items.map(p => ({ ...p, categoria }))
      );
      await Producto.insertMany(docs);
      console.log(`${docs.length} productos sembrados desde productos.js`);
    }
  })
  .catch(err => console.log("Error MongoDB:", err));

// ─── RUTAS PRODUCTOS ────────────────────────────────────────────

// GET /productos — devuelve todos agrupados por categoría
app.get("/productos", async (req, res) => {
  try {
    const todos = await Producto.find().sort({ categoria: 1, createdAt: 1 });
    const agrupados = {};
    todos.forEach(p => {
      if (!agrupados[p.categoria]) agrupados[p.categoria] = [];
      agrupados[p.categoria].push({
        id: p._id,
        nombre: p.nombre,
        precio: p.precio,
        imagen: p.imagen,
        imagenes: p.imagenes || [],
        descripcion: p.descripcion,
        marca: p.marca,
        categoria: p.categoria,
        stock: p.stock ?? 0,
        variantes: p.variantes || []
      });
    });
    res.json(agrupados);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// POST /productos — crear producto (admin)
app.post("/productos", isAdmin, async (req, res) => {
  try {
    const { nombre, precio, imagen, imagenes, descripcion, marca, categoria, variantes, stock } = req.body;
    if (!nombre || !precio || !categoria) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    const nuevo = new Producto({ nombre, precio: Number(precio), imagen, imagenes: imagenes || [], descripcion, marca, categoria, stock: Number(stock) || 0, variantes: variantes || [] });
    await nuevo.save();
    res.json({ ok: true, producto: nuevo });
  } catch (error) {
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// PUT /productos/:id — editar producto (admin)
app.put("/productos/:id", isAdmin, async (req, res) => {
  try {
    const { nombre, precio, imagen, imagenes, descripcion, marca, categoria, variantes, stock } = req.body;
    const actualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      { $set: { nombre, precio: Number(precio), imagen, imagenes: imagenes || [], descripcion, marca, categoria, stock: Number(stock) || 0, variantes: variantes || [] } },
      { new: true, strict: false }
    );
    if (!actualizado) return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ ok: true, producto: actualizado });
  } catch (error) {
    console.error("Error PUT producto:", error);
    res.status(500).json({ error: "Error al editar producto" });
  }
});

// DELETE /productos/:id — eliminar producto (admin)
app.delete("/productos/:id", isAdmin, async (req, res) => {
  try {
    await Producto.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

// DELETE /productos/categoria/:nombre — eliminar categoría entera (admin)
app.delete("/productos/categoria/:nombre", isAdmin, async (req, res) => {
  try {
    await Producto.deleteMany({ categoria: req.params.nombre });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar categoría" });
  }
});

// ────────────────────────────────────────────────────────────────

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor Funtek funcionando 🚀");
});

// Tabla de precios de envío por zona
// Actualizar estos valores cuando cambien las tarifas
const TARIFAS_ENVIO = [
  {
    id: "rosario",
    nombre: "Rosario y alrededores",
    precio: 7500,
    dias: "1-2",
    rangos: [[2000, 2099]]
  },
  {
    id: "santa_fe",
    nombre: "Santa Fe provincia",
    precio: 9500,
    dias: "2-3",
    rangos: [[2100, 3299]]
  },
  {
    id: "caba_gba",
    nombre: "CABA y GBA",
    precio: 11000,
    dias: "2-3",
    rangos: [[1000, 1999]]
  },
  {
    id: "interior",
    nombre: "Interior del país",
    precio: 12500,
    dias: "3-5",
    rangos: [[3300, 5999], [6000, 8399]]
  },
  {
    id: "noa_nea",
    nombre: "NOA y NEA",
    precio: 13500,
    dias: "4-6",
    rangos: [[3000, 3099], [3400, 3799], [4000, 4799]]
  },
  {
    id: "patagonia",
    nombre: "Patagonia",
    precio: 14000,
    dias: "5-7",
    rangos: [[8400, 9499]]
  }
];

function detectarZona(cp) {
  const cpNum = parseInt(cp);
  if (isNaN(cpNum)) return null;
  return TARIFAS_ENVIO.find(zona =>
    zona.rangos.some(([min, max]) => cpNum >= min && cpNum <= max)
  ) || TARIFAS_ENVIO.find(z => z.id === "interior"); // fallback interior
}

// Cotizar envío por tabla de precios
app.post("/cotizar-envio", (req, res) => {
  const { codigoPostalDestino } = req.body;

  if (!codigoPostalDestino) {
    return res.status(400).json({ error: "Falta el código postal" });
  }

  const zona = detectarZona(codigoPostalDestino);

  if (!zona) {
    return res.status(400).json({ error: "Código postal no reconocido" });
  }

  res.json({
    opciones: [{
      id: zona.id,
      nombre: zona.nombre,
      precio: zona.precio,
      dias: zona.dias
    }]
  });
});

// Crear preferencia de pago
app.post("/crear-preferencia", async (req, res) => {
  try {
    const { items, email, nombre, envio } = req.body;

    const externalRef = email + "_" + Date.now();

    const itemsMP = items.map(item => ({
      title: item.nombre,
      unit_price: Number(item.precio),
      quantity: Number(item.cantidad),
      currency_id: "ARS"
    }));

    // Si el cliente eligió envío, lo agregamos como item adicional
    if (envio) {
      itemsMP.push({
        title: `Envío — ${envio.nombre}`,
        unit_price: Number(envio.precio),
        quantity: 1,
        currency_id: "ARS"
      });
    }

    const preference = new Preference(client);

    const preferenceBody = {
      items: itemsMP,
      metadata: { email, nombre },
      external_reference: externalRef,
      notification_url: "https://monserrate-unrepented-noncreditably.ngrok-free.dev/webhook",
      back_urls: {
        success: "http://localhost:5173/pago-exitoso",
        failure: "http://localhost:5173/pago-fallido",
        pending: "http://localhost:5173/pago-pendiente"
      }
    };

    // Agregar datos de envío a la preferencia si los hay
    if (envio?.codigoPostal) {
      preferenceBody.shipments = {
        mode: "not_specified",
        receiver_address: {
          zip_code: envio.codigoPostal
        }
      };
    }

    const response = await preference.create({ body: preferenceBody });

    const nuevoPedido = new Pedido({
      email,
      nombre,
      items,
      external_reference: externalRef,
      estado: "pendiente",
      envio: envio || null
    });

    await nuevoPedido.save();

    try {
      const totalPedido = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
      await enviarEmailConfirmacion(email, nombre, items, totalPedido);
    } catch (emailError) {
      console.error("Error al enviar email de confirmación:", emailError);
    }

    res.json({ init_point: response.init_point });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear preferencia" });
  }
});

// Registro
// ─── VALIDACIÓN DE EMAIL ────────────────────────────────────────
const DOMINIOS_VALIDOS = [
  "gmail.com","hotmail.com","outlook.com","yahoo.com","icloud.com",
  "live.com","msn.com","protonmail.com","proton.me","zoho.com",
  "tutanota.com","fastmail.com","aol.com","mail.com","yandex.com",
  "gmx.com","hey.com","me.com","mac.com","hotmail.es","yahoo.es",
  "outlook.es","live.com.ar","hotmail.com.ar","yahoo.com.ar","fibertel.com.ar",
  "arnet.com.ar","ciudad.com.ar","speedy.com.ar","utn.edu.ar","uba.ar"
];

const DOMINIOS_TEMPORALES = [
  "mailinator.com","tempmail.com","guerrillamail.com","10minutemail.com",
  "throwam.com","yopmail.com","sharklasers.com","guerrillamailblock.com",
  "grr.la","guerrillamail.info","spam4.me","trashmail.com","dispostable.com",
  "maildrop.cc","fakeinbox.com","temp-mail.org","discard.email","mailnull.com",
  "spamgourmet.com","trashmail.me","wegwerfmail.de","emailondeck.com"
];

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return { ok: false, msg: "El email no tiene un formato válido" };
  const dominio = email.split("@")[1].toLowerCase();
  if (DOMINIOS_TEMPORALES.includes(dominio)) return { ok: false, msg: "No se permiten emails temporales" };
  if (!DOMINIOS_VALIDOS.includes(dominio)) return { ok: false, msg: "Usá un email real (Gmail, Hotmail, Outlook, etc.)" };
  return { ok: true };
}
// ────────────────────────────────────────────────────────────────

app.post("/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: "Completá todos los campos" });
    }

    const validacion = validarEmail(email);
    if (!validacion.ok) {
      return res.status(400).json({ message: validacion.msg });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Ya existe una cuenta con ese email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ nombre, email, password: hashedPassword });
    await user.save();

    // Email de bienvenida
    try {
      await enviarEmailBienvenida(email, nombre);
    } catch (emailError) {
      console.error("Error al enviar email de bienvenida:", emailError);
    }

    res.json({ message: "Usuario creado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el registro" });
  }
});

// Login Cliente
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login exitoso",
      token,
      email: user.email,
      nombre: user.nombre
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el login" });
  }
});

// Login Admin
app.post("/login-admin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "No tenés permisos de admin" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login admin exitoso",
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el login admin" });
  }
});


// ─── DESCONTAR STOCK ────────────────────────────────────────────
async function descontarStock(items) {
  for (const item of items) {
    try {
      const producto = await Producto.findById(item.id);
      if (!producto) continue;

      if (item.variantesElegidas && Object.keys(item.variantesElegidas).length > 0) {
        // Producto con variantes — descontar stock de cada opción elegida
        let modificado = false;
        const variantes = producto.variantes.map(v => {
          const opcionElegida = item.variantesElegidas[v.nombre];
          if (!opcionElegida) return v;
          return {
            ...v.toObject(),
            opciones: v.opciones.map(op => {
              if (op.nombre === opcionElegida && op.stock > 0) {
                modificado = true;
                return { ...op.toObject(), stock: op.stock - (item.cantidad || 1) };
              }
              return op;
            })
          };
        });
        if (modificado) {
          await Producto.findByIdAndUpdate(item.id, { $set: { variantes } }, { strict: false });
        }
      } else {
        // Producto sin variantes — descontar stock general
        if (producto.stock > 0) {
          await Producto.findByIdAndUpdate(
            item.id,
            { $inc: { stock: -(item.cantidad || 1) } }
          );
        }
      }
    } catch (err) {
      console.error("Error descontando stock de producto", item.id, err.message);
    }
  }
}
// ────────────────────────────────────────────────────────────────
// Webhook de MercadoPago
app.post("/webhook", async (req, res) => {
  try {

    if (req.body.type === "payment") {

      const paymentId = req.body.data.id;

      const payment = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
          }
        }
      );

      const paymentData = await payment.json();

      console.log("External ref recibida:", paymentData.external_reference);
      console.log("Estado real MP:", paymentData.status);

      let nuevoEstado = "pendiente";

      if (paymentData.status === "approved") {
        nuevoEstado = "pagado";
      } else if (paymentData.status === "rejected") {
        nuevoEstado = "rechazado";
      } else if (paymentData.status === "in_process") {
        nuevoEstado = "en_proceso";
      }

      const pedidoActualizado = await Pedido.findOneAndUpdate(
        { external_reference: paymentData.external_reference },
        { estado: nuevoEstado, paymentId: paymentId },
        { new: true }
      );

      if (pedidoActualizado && nuevoEstado === "pagado") {
        try {
          await enviarEmailConfirmacion(
            pedidoActualizado.email,
            pedidoActualizado.nombre,
            pedidoActualizado.items,
            pedidoActualizado.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
          );
        } catch (emailError) {
          console.error("Error al enviar email de pago:", emailError);
        }
        try {
          await descontarStock(pedidoActualizado.items);
        } catch (stockError) {
          console.error("Error al descontar stock:", stockError);
        }
      }

      console.log("Pedido actualizado correctamente 🚀");
    }

    res.sendStatus(200);

  } catch (error) {
    console.error("Error en webhook:", error);
    res.sendStatus(500);
  }
});

// Pedidos del cliente logueado
app.get("/mis-pedidos", verificarToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const pedidos = await Pedido.find({ email: user.email }).sort({ createdAt: -1 });

    res.json(pedidos);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
});

app.get("/pedidos", isAdmin, async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
});

app.put("/pedidos/:id", isAdmin, async (req, res) => {
  try {
    const { estado } = req.body;

    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );

    if (pedidoActualizado) {
      try {
        if (estado === "Enviado") {
          await enviarEmailEnviado(pedidoActualizado.email, pedidoActualizado.nombre);
        } else if (estado === "Entregado") {
          await enviarEmailEntregado(pedidoActualizado.email, pedidoActualizado.nombre);
        }
      } catch (emailError) {
        console.error("Error al enviar email de estado:", emailError);
      }
      // Descontar stock cuando el admin confirma el pago de una transferencia
      if (estado === "pagado") {
        try {
          await descontarStock(pedidoActualizado.items);
        } catch (stockError) {
          console.error("Error al descontar stock (transferencia):", stockError);
        }
      }
    }

    res.json(pedidoActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar pedido" });
  }
});

// Obtener reseñas de un producto
app.get("/resenas/:productoId", async (req, res) => {
  try {
    const resenas = await Resena.find({ productoId: req.params.productoId })
      .sort({ createdAt: -1 });
    res.json(resenas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener reseñas" });
  }
});

// Crear reseña
app.post("/resenas", verificarToken, async (req, res) => {
  try {
    const { productoId, estrellas, comentario } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si ya reseñó este producto
    const resenaExistente = await Resena.findOne({
      productoId,
      usuarioId: req.user.id
    });

    if (resenaExistente) {
      return res.status(400).json({ message: "Ya reseñaste este producto" });
    }

    const resena = new Resena({
      productoId,
      usuarioId: req.user.id,
      nombreUsuario: user.nombre,
      estrellas,
      comentario
    });

    await resena.save();

    res.json({ message: "Reseña guardada ✅", resena });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar reseña" });
  }
});

// Pedido manual (transferencia o efectivo)
app.post("/pedido-manual", async (req, res) => {
  try {
    const { items, email, nombre, metodoPago } = req.body;
    if (!items || !email || !nombre || !metodoPago) {
      return res.status(400).json({ ok: false, message: "Faltan datos" });
    }

    const externalRef = email + "_" + Date.now();

    const nuevoPedido = new Pedido({
      email,
      nombre,
      items,
      external_reference: externalRef,
      estado: "pendiente",
      metodoPago
    });

    await nuevoPedido.save();

    const total = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

    // Email de confirmación con instrucciones según método
    try {
      await enviarEmailConfirmacion(email, nombre, items, total, metodoPago);
    } catch (emailError) {
      console.error("Error al enviar email pedido manual:", emailError);
    }

    // Descontar stock solo si paga en efectivo (la transacción se coordina al momento)
    if (metodoPago === "efectivo") {
      try {
        await descontarStock(items);
      } catch (stockError) {
        console.error("Error al descontar stock (efectivo):", stockError);
      }
    }

    res.json({ ok: true, pedidoId: nuevoPedido._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error al guardar pedido" });
  }
});

app.post("/contacto", async (req, res) => {
  const { nombre, email, mensaje } = req.body;
  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ mensaje: "Completá todos los campos" });
  }
  try {
    await enviarEmailContacto(nombre, email, mensaje);
    res.json({ ok: true });
  } catch (error) {
    console.error("Error al enviar email de contacto:", error);
    res.status(500).json({ mensaje: "Error al enviar el mensaje" });
  }
});

// ─── RESET DE CONTRASEÑA ────────────────────────────────────────

// Solicitar reset
app.post("/reset-password/solicitar", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Ingresá tu email" });

    const user = await User.findOne({ email });
    // Siempre responder ok para no revelar si el email existe
    if (!user) return res.json({ ok: true });

    const token = crypto.randomBytes(32).toString("hex");
    const expira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    user.resetToken = token;
    user.resetTokenExpira = expira;
    await user.save();

    try {
      await enviarEmailResetPassword(email, user.nombre, token);
    } catch (emailError) {
      console.error("Error al enviar email de reset:", emailError);
    }

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al procesar la solicitud" });
  }
});

// Confirmar reset
app.post("/reset-password/confirmar", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Datos inválidos" });
    if (password.length < 6) return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpira: { $gt: new Date() }
    });

    if (!user) return res.status(400).json({ message: "El link expiró o no es válido" });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpira = undefined;
    await user.save();

    res.json({ ok: true, message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al restablecer la contraseña" });
  }
});

// ────────────────────────────────────────────────────────────────

// ─── LOGIN CON GOOGLE ────────────────────────────────────────────
app.post("/auth/google", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token requerido" });

    // Verificar el token con Google
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const googleData = await googleRes.json();

    if (googleData.error) {
      return res.status(401).json({ message: "Token de Google inválido" });
    }

    if (googleData.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ message: "Token no válido para esta app" });
    }

    const { email, name, sub: googleId } = googleData;

    // Buscar o crear usuario
    let user = await User.findOne({ email });

    if (!user) {
      // Crear usuario nuevo con Google
      user = new User({
        nombre: name,
        email,
        password: await bcrypt.hash(googleId + process.env.JWT_SECRET, 10),
        googleId
      });
      await user.save();

      // Email de bienvenida
      try {
        await enviarEmailBienvenida(email, name);
      } catch (emailError) {
        console.error("Error al enviar email de bienvenida (Google):", emailError);
      }
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Login exitoso",
      token: jwtToken,
      email: user.email,
      nombre: user.nombre
    });

  } catch (error) {
    console.error("Error en auth Google:", error);
    res.status(500).json({ message: "Error al autenticar con Google" });
  }
});
// ────────────────────────────────────────────────────────────────

// ─── PERFIL ──────────────────────────────────────────────────────

// GET perfil
app.get("/perfil", verificarToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -resetToken -resetTokenExpira");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener perfil" });
  }
});

// PUT editar perfil
app.put("/perfil", verificarToken, async (req, res) => {
  try {
    const { nombre, email, telefono } = req.body;
    if (!nombre || !email) return res.status(400).json({ message: "Nombre y email son obligatorios" });

    // Verificar que el email no lo use otro usuario
    const existente = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existente) return res.status(400).json({ message: "Ese email ya está en uso" });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { nombre, email, telefono } },
      { new: true }
    ).select("-password");

    res.json({ ok: true, user });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar perfil" });
  }
});

// ─── DIRECCIONES ─────────────────────────────────────────────────

// GET direcciones
app.get("/direcciones", verificarToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("direcciones");
    res.json(user?.direcciones || []);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener direcciones" });
  }
});

// POST agregar dirección
app.post("/direcciones", verificarToken, async (req, res) => {
  try {
    const { calle, numero, piso, localidad, provincia, codigoPostal } = req.body;
    if (!calle || !numero || !localidad || !provincia || !codigoPostal) {
      return res.status(400).json({ message: "Completá todos los campos obligatorios" });
    }
    const nuevaDireccion = { calle, numero, piso, localidad, provincia, codigoPostal };
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { direcciones: nuevaDireccion } },
      { new: true }
    ).select("direcciones");
    res.json({ ok: true, direcciones: user.direcciones });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar dirección" });
  }
});

// PUT editar dirección
app.put("/direcciones/:dirId", verificarToken, async (req, res) => {
  try {
    const { calle, numero, piso, localidad, provincia, codigoPostal } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: req.user.id, "direcciones._id": req.params.dirId },
      { $set: { "direcciones.$.calle": calle, "direcciones.$.numero": numero, "direcciones.$.piso": piso, "direcciones.$.localidad": localidad, "direcciones.$.provincia": provincia, "direcciones.$.codigoPostal": codigoPostal } },
      { new: true }
    ).select("direcciones");
    res.json({ ok: true, direcciones: user.direcciones });
  } catch (error) {
    res.status(500).json({ message: "Error al editar dirección" });
  }
});

// DELETE eliminar dirección
app.delete("/direcciones/:dirId", verificarToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { direcciones: { _id: req.params.dirId } } },
      { new: true }
    ).select("direcciones");
    res.json({ ok: true, direcciones: user.direcciones });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar dirección" });
  }
});

// DELETE cuenta — eliminar cuenta del cliente logueado
app.delete("/cuenta", verificarToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ ok: true, message: "Cuenta eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la cuenta" });
  }
});

// ────────────────────────────────────────────────────────────────

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000 🔥");
});