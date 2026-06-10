import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { User, Material, Entrada, Salida, Movimiento } from "./src/types.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// Path for Database
const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

// Ensure Data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DBStructure {
  users: User[];
  materials: Material[];
  entradas: Entrada[];
  salidas: Salida[];
  movimientos: Movimiento[];
}

const getTodayDateString = () => {
  return new Date().toISOString().split("T")[0];
};

const getTodayDateTimeString = () => {
  const now = new Date();
  return now.toLocaleString("es-ES", { timeZone: "UTC" }) + " UTC";
};

// Default DB state (loads if db.json is missing or corrupt)
const getDefaultDB = (): DBStructure => {
  const today = getTodayDateString();
  const dateTime = getTodayDateTimeString();

  return {
    users: [
      {
        id: "u-1",
        username: "Danae",
        nombre: "Danae Administradora",
        rol: "administrador",
        estado: "activo",
        password: "88888888"
      },
      {
        id: "u-2",
        username: "juan_tecnico",
        nombre: "Juan Pérez",
        rol: "técnico",
        estado: "activo",
        password: "123"
      },
      {
        id: "u-3",
        username: "maria_tecnico",
        nombre: "María Rodríguez",
        rol: "técnico",
        estado: "activo",
        password: "123"
      }
    ],
    materials: [
      {
        codigo: "M-101",
        nombre: "Casco de Seguridad MSA Blanco",
        categoria: "EPP",
        descripcion: "Casco protector de ala completa dieléctrico clase E.",
        stockActual: 15,
        stockMinimo: 5,
        estadoOperativo: "Operativo"
      },
      {
        codigo: "M-102",
        nombre: "Multímetro Digital Fluke 117",
        categoria: "Eléctricos",
        descripcion: "Multímetro profesional paraelectricista con detección de volt.",
        stockActual: 4,
        stockMinimo: 2,
        estadoOperativo: "Operativo"
      },
      {
        codigo: "M-103",
        nombre: "Taladro Percutor DeWalt 20V",
        categoria: "Herramientas",
        descripcion: "Taladro percutor de 1/2 pulgada inalámbrico con 2 baterías.",
        stockActual: 1,
        stockMinimo: 3,
        estadoOperativo: "En Mantenimiento"
      },
      {
        codigo: "M-104",
        nombre: "Cable de Cobre THHN 12 AWG",
        categoria: "Eléctricos",
        descripcion: "Rollo de 100 metros de conductor de cobre con aislamiento termoplástico.",
        stockActual: 0,
        stockMinimo: 2,
        estadoOperativo: "Operativo"
      },
      {
        codigo: "M-105",
        nombre: "Guantes de Nitrilo Antidesgaste",
        categoria: "EPP",
        descripcion: "Par de guantes de trabajo reforzados para agarre y abrasión.",
        stockActual: 50,
        stockMinimo: 10,
        estadoOperativo: "Operativo"
      },
      {
        codigo: "M-106",
        nombre: "Alicates Pelacables Stanley",
        categoria: "Herramientas",
        descripcion: "Herramienta manual Stanley auto-ajustable de alta precisión.",
        stockActual: 8,
        stockMinimo: 3,
        estadoOperativo: "Operativo"
      },
      {
        codigo: "M-107",
        nombre: "Cinta Aislante 3M Super 33+",
        categoria: "Eléctricos",
        descripcion: "Cinta adhesiva aislante de PVC premium para empalmes eléctricos.",
        stockActual: 25,
        stockMinimo: 8,
        estadoOperativo: "Operativo"
      }
    ],
    entradas: [
      {
        id: "ent-1",
        fecha: today,
        materialCodigo: "M-101",
        materialNombre: "Casco de Seguridad MSA Blanco",
        cantidad: 10,
        proveedor: "Seguridad Industrial S.A.",
        responsable: "Danae Administradora",
        observaciones: "Entrada regular de reposición mensual.",
        timestamp: dateTime
      },
      {
        id: "ent-2",
        fecha: today,
        materialCodigo: "M-105",
        materialNombre: "Guantes de Nitrilo Antidesgaste",
        cantidad: 30,
        proveedor: "Distribuidora EPP S.R.L.",
        responsable: "Danae Administradora",
        observaciones: "Firma de recepción archivada.",
        timestamp: dateTime
      }
    ],
    salidas: [
      {
        id: "sal-1",
        fecha: today,
        materialCodigo: "M-103",
        materialNombre: "Taladro Percutor DeWalt 20V",
        cantidad: 1,
        tecnicoSolicitante: "Juan Pérez",
        motivo: "Se retira para revisión técnica urgente.",
        timestamp: dateTime
      },
      {
        id: "sal-2",
        fecha: today,
        materialCodigo: "M-102",
        materialNombre: "Multímetro Digital Fluke 117",
        cantidad: 1,
        tecnicoSolicitante: "María Rodríguez",
        motivo: "Mantenimiento preventivo subestación norte.",
        timestamp: dateTime
      }
    ],
    movimientos: [
      {
        id: "mov-1",
        usuario: "Danae Administradora",
        fechaHora: dateTime,
        accion: "REGISTRO DE ENTRADA (+10 unidades)",
        materialAfectado: "M-101 (Casco de Seguridad MSA Blanco)"
      },
      {
        id: "mov-2",
        usuario: "Danae Administradora",
        fechaHora: dateTime,
        accion: "REGISTRO DE ENTRADA (+30 unidades)",
        materialAfectado: "M-105 (Guantes de Nitrilo Antidesgaste)"
      },
      {
        id: "mov-3",
        usuario: "Juan Pérez",
        fechaHora: dateTime,
        accion: "REGISTRO DE SALIDA (-1 unidad)",
        materialAfectado: "M-103 (Taladro Percutor DeWalt 20V)"
      },
      {
        id: "mov-4",
        usuario: "María Rodríguez",
        fechaHora: dateTime,
        accion: "REGISTRO DE SALIDA (-1 unidad)",
        materialAfectado: "M-102 (Multímetro Digital Fluke 117)"
      },
      {
        id: "mov-5",
        usuario: "Sistema",
        fechaHora: dateTime,
        accion: "INICIALIZACIÓN DEL SISTEMA",
        materialAfectado: "Carga de catálogo inicial"
      }
    ]
  };
};

// Read database
const readDB = (): DBStructure => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const defaultState = getDefaultDB();
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultState, null, 2), "utf-8");
      return defaultState;
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading DB file, returning defaults. Error:", err);
    return getDefaultDB();
  }
};

// Write database
const writeDB = (data: DBStructure) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving DB file:", err);
  }
};

// Helper to log operations
const logMovement = (usuario: string, accion: string, materialAfectado: string) => {
  const db = readDB();
  const newMovement: Movimiento = {
    id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    usuario,
    fechaHora: getTodayDateTimeString(),
    accion,
    materialAfectado
  };
  db.movimientos.unshift(newMovement); // add to top of array
  writeDB(db);
};

// --- AUTH API ---
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Usuario y contraseña requeridos" });
  }

  const db = readDB();
  const user = db.users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  if (user.estado === "inactivo") {
    return res.status(403).json({ error: "Usuario inactivo en el sistema" });
  }

  // Return user info and a token placeholder (or direct session)
  const userResponse = { ...user };
  delete userResponse.password;
  res.json({ token: `token-${user.id}-${Date.now()}`, user: userResponse });
});

// --- USERS API : ADMINS ONLY ---
app.get("/api/users", (req, res) => {
  const db = readDB();
  // Strip passwords before sending
  const cleanUsers = db.users.map(({ password, ...u }) => u);
  res.json(cleanUsers);
});

app.post("/api/users", (req, res) => {
  const { username, nombre, rol, estado, password, operatorName } = req.body;
  if (!username || !nombre || !rol || !password) {
    return res.status(400).json({ error: "Campos requeridos incompletos" });
  }

  const db = readDB();
  const exists = db?.users?.some((u) => u.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "El nombre de usuario ya está registrado" });
  }

  const newUser: User = {
    id: `u-${Date.now()}`,
    username,
    nombre,
    rol,
    estado: estado || "activo",
    password
  };

  db.users.push(newUser);
  writeDB(db);

  logMovement(
    operatorName || "Administrador",
    `REGISTRO DE USUARIO (${rol.toUpperCase()})`,
    `Usuario: ${username} (${nombre})`
  );

  const { password: _, ...cleanUser } = newUser;
  res.status(201).json(cleanUser);
});

app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, rol, estado, password, operatorName } = req.body;

  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  if (db.users[userIndex].username === "Danae" && rol !== "administrador") {
    return res.status(400).json({ error: "No es posible degradar al administrador principal Danae" });
  }

  if (db.users[userIndex].username === "Danae" && estado === "inactivo") {
    return res.status(400).json({ error: "No se puede desactivar al administrador principal" });
  }

  const updatedUser = { ...db.users[userIndex] };
  if (nombre) updatedUser.nombre = nombre;
  if (rol) updatedUser.rol = rol;
  if (estado) updatedUser.estado = estado;
  if (password) updatedUser.password = password;

  db.users[userIndex] = updatedUser;
  writeDB(db);

  logMovement(
    operatorName || "Administrador",
    `EDICIÓN DE USUARIO`,
    `Usuario: ${updatedUser.username}`
  );

  const { password: _, ...cleanUser } = updatedUser;
  res.json(cleanUser);
});

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const operatorName = (req.query.operatorName as string) || "Administrador";

  const db = readDB();
  const user = db.users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  if (user.username === "Danae") {
    return res.status(400).json({ error: "El administrador principal Danae no puede ser eliminado" });
  }

  db.users = db.users.filter((u) => u.id !== id);
  writeDB(db);

  logMovement(operatorName, "ELIMINACIÓN DE USUARIO", `Usuario: ${user.username} (${user.nombre})`);
  res.json({ success: true });
});

// --- MATERIALS API ---
app.get("/api/materials", (req, res) => {
  const db = readDB();
  res.json(db.materials);
});

app.post("/api/materials", (req, res) => {
  const { codigo, nombre, categoria, descripcion, stockActual, stockMinimo, estadoOperativo, operatorName } = req.body;
  
  if (!codigo || !nombre || !categoria || stockActual === undefined || stockMinimo === undefined || !estadoOperativo) {
    return res.status(400).json({ error: "Campos obligatorios incompletos" });
  }

  const db = readDB();
  const exists = db.materials.some((m) => m.codigo.toLowerCase() === codigo.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "Ya existe un material con este código" });
  }

  const newMaterial: Material = {
    codigo,
    nombre,
    categoria,
    descripcion: descripcion || "",
    stockActual: Number(stockActual),
    stockMinimo: Number(stockMinimo),
    estadoOperativo: estadoOperativo
  };

  db.materials.push(newMaterial);
  writeDB(db);

  logMovement(
    operatorName || "Sistema",
    `REGISTRO DE MATERIAL (Stock inicial: ${stockActual})`,
    `${codigo} (${nombre})`
  );

  res.status(201).json(newMaterial);
});

app.put("/api/materials/:codigo", (req, res) => {
  const { codigo } = req.params;
  const { nombre, categoria, descripcion, stockActual, stockMinimo, estadoOperativo, operatorName } = req.body;

  const db = readDB();
  const idx = db.materials.findIndex((m) => m.codigo.toLowerCase() === codigo.toLowerCase());

  if (idx === -1) {
    return res.status(404).json({ error: "Material no encontrado" });
  }

  const mat = db.materials[idx];
  const oldStock = mat.stockActual;

  const updatedMaterial: Material = {
    codigo: mat.codigo, // code is never changed directly to avoid orphan records
    nombre: nombre || mat.nombre,
    categoria: categoria || mat.categoria,
    descripcion: descripcion === undefined ? mat.descripcion : descripcion,
    stockActual: stockActual !== undefined ? Number(stockActual) : mat.stockActual,
    stockMinimo: stockMinimo !== undefined ? Number(stockMinimo) : mat.stockMinimo,
    estadoOperativo: estadoOperativo || mat.estadoOperativo
  };

  db.materials[idx] = updatedMaterial;
  writeDB(db);

  const stockDiff = updatedMaterial.stockActual - oldStock;
  const actMsg = stockDiff !== 0 ? `MODIFICACIÓN DE FROND / STOCK (Stock: ${oldStock} -> ${updatedMaterial.stockActual})` : "EDICIÓN DE DATOS";
  
  logMovement(
    operatorName || "Sistema",
    actMsg,
    `${updatedMaterial.codigo} (${updatedMaterial.nombre})`
  );

  res.json(updatedMaterial);
});

app.delete("/api/materials/:codigo", (req, res) => {
  const { codigo } = req.params;
  const operatorName = (req.query.operatorName as string) || "Sistema";

  const db = readDB();
  const mat = db.materials.find((m) => m.codigo.toLowerCase() === codigo.toLowerCase());

  if (!mat) {
    return res.status(404).json({ error: "Material no encontrado" });
  }

  // Delete materials
  db.materials = db.materials.filter((m) => m.codigo.toLowerCase() !== codigo.toLowerCase());
  writeDB(db);

  logMovement(
    operatorName,
    "ELIMINACIÓN DE MATERIAL",
    `${mat.codigo} (${mat.nombre})`
  );

  res.json({ success: true });
});

// --- ENTRADAS API ---
app.get("/api/entries", (req, res) => {
  const db = readDB();
  res.json(db.entradas);
});

app.post("/api/entries", (req, res) => {
  const { materialCodigo, cantidad, proveedor, responsable, observaciones, fecha } = req.body;

  if (!materialCodigo || !cantidad || !responsable) {
    return res.status(400).json({ error: "Datos de entrada incompletos" });
  }

  const db = readDB();
  const matIdx = db.materials.findIndex((m) => m.codigo === materialCodigo);

  if (matIdx === -1) {
    return res.status(404).json({ error: "Código de material incorrecto" });
  }

  const mat = db.materials[matIdx];
  const entQty = Number(cantidad);

  if (entQty <= 0) {
    return res.status(400).json({ error: "La cantidad ingresada debe ser mayor a cero" });
  }

  // Update current stock
  const originalStock = mat.stockActual;
  mat.stockActual += entQty;

  const tday = getTodayDateString();
  const nowStr = getTodayDateTimeString();

  const newEntry: Entrada = {
    id: `ent-${Date.now()}`,
    fecha: fecha || tday,
    materialCodigo,
    materialNombre: mat.nombre,
    cantidad: entQty,
    proveedor: proveedor || "No Especificado",
    responsable,
    observaciones: observaciones || "",
    timestamp: nowStr
  };

  db.entradas.unshift(newEntry);
  writeDB(db);

  logMovement(
    responsable,
    `REGISTRO DE ENTRADA (+${entQty} unids. Stock: ${originalStock} -> ${mat.stockActual})`,
    `${mat.codigo} (${mat.nombre})`
  );

  res.status(201).json(newEntry);
});

// --- SALIDAS API ---
app.get("/api/exits", (req, res) => {
  const db = readDB();
  res.json(db.salidas);
});

app.post("/api/exits", (req, res) => {
  const { materialCodigo, cantidad, tecnicoSolicitante, motive, fecha, operatorName } = req.body;

  if (!materialCodigo || !cantidad || !tecnicoSolicitante || !motive) {
    return res.status(400).json({ error: "Material, cantidad, técnico solicitante y motivo son obligatorios" });
  }

  const db = readDB();
  const matIdx = db.materials.findIndex((m) => m.codigo === materialCodigo);

  if (matIdx === -1) {
    return res.status(404).json({ error: "Código de material incorrecto" });
  }

  const mat = db.materials[matIdx];
  const exitQty = Number(cantidad);

  if (exitQty <= 0) {
    return res.status(400).json({ error: "La cantidad solicitada debe ser mayor a cero" });
  }

  if (mat.stockActual < exitQty) {
    return res.status(400).json({
      error: `Stock insuficiente. Stock actual: ${mat.stockActual} unidades. Solicitado: ${exitQty} unidades.`
    });
  }

  // Update stock
  const originalStock = mat.stockActual;
  mat.stockActual -= exitQty;

  // Add exit
  const tday = getTodayDateString();
  const nowStr = getTodayDateTimeString();

  const newExit: Salida = {
    id: `sal-${Date.now()}`,
    fecha: fecha || tday,
    materialCodigo,
    materialNombre: mat.nombre,
    cantidad: exitQty,
    tecnicoSolicitante,
    motivo: motive,
    timestamp: nowStr
  };

  db.salidas.unshift(newExit);
  writeDB(db);

  logMovement(
    operatorName || tecnicoSolicitante,
    `REGISTRO DE SALIDA (-${exitQty} unids. Aux: ${tecnicoSolicitante}. Stock: ${originalStock} -> ${mat.stockActual})`,
    `${mat.codigo} (${mat.nombre})`
  );

  res.status(201).json(newExit);
});

// --- MOVEMENTS API ---
app.get("/api/movements", (req, res) => {
  const db = readDB();
  res.json(db.movimientos);
});

// --- DASHBOARD AND COMBINED METRICS ---
app.get("/api/stats", (req, res) => {
  const db = readDB();
  const today = getTodayDateString();

  const totalMateriales = db.materials.length;
  
  // Dynamic metrics
  let stockDisponible = 0;
  let materialesBajoStock = 0;

  db.materials.forEach((m) => {
    if (m.stockActual === 0) {
      // exhausted, not available
    } else if (m.stockActual < m.stockMinimo) {
      materialesBajoStock++;
      stockDisponible += m.stockActual;
    } else {
      stockDisponible += m.stockActual;
    }
  });

  // Today entries & exits total
  const entriesToday = db.entradas
    .filter((e) => e.fecha === today)
    .reduce((sum, e) => sum + e.cantidad, 0);

  const exitsToday = db.salidas
    .filter((s) => s.fecha === today)
    .reduce((sum, s) => sum + s.cantidad, 0);

  // Category breakdown for recharts
  const categoryMap: { [key: string]: number } = {};
  db.materials.forEach((m) => {
    categoryMap[m.categoria] = (categoryMap[m.categoria] || 0) + m.stockActual;
  });
  const categoryStats = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    stock: categoryMap[cat]
  }));

  // Top 5 elements with low stock or most usages (exits)
  const usageMap: { [key: string]: number } = {};
  db.salidas.forEach((s) => {
    usageMap[s.materialNombre] = (usageMap[s.materialNombre] || 0) + s.cantidad;
  });
  const mostUsedStats = Object.keys(usageMap)
    .map((name) => ({ name, salidas: usageMap[name] }))
    .sort((a, b) => b.salidas - a.salidas)
    .slice(0, 5);

  const stats = {
    summary: {
      totalMateriales,
      stockDisponible,
      materialesBajoStock,
      entradasHoy: entriesToday,
      salidasHoy: exitsToday
    },
    categoryStats,
    mostUsedStats,
    bajoStockLista: db.materials
      .filter((m) => m.stockActual < m.stockMinimo)
      .map((m) => ({
        codigo: m.codigo,
        nombre: m.nombre,
        stockActual: m.stockActual,
        stockMinimo: m.stockMinimo,
        estado: m.stockActual === 0 ? "agotado" : "stock bajo"
      }))
  };

  res.json(stats);
});


// Vite Dev / Prod Handling
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start Server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
