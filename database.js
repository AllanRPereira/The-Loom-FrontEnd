import sqlite3 from 'sqlite3';

const verboseSqlite = sqlite3.verbose();
const DB_FILE = './the-loom-hackathon.db'; 

// Esta função vai popular nossos dados de demonstração
const db = new verboseSqlite.Database(DB_FILE, (err) => {
  if (err) return console.error('Erro ao conectar ao banco de dados:', err.message);
  console.log('Conectado ao banco de dados SQLite.');
  // ... (código de conexão) ...
  db.serialize(() => {
    // Passo 1: Criar a tabela (Substitui o migrate.ts / schema.sql)
    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL, 
      price REAL NOT NULL,
      description TEXT,
      type TEXT NOT NULL CHECK(type IN ('AI', '3D Rendering', 'Data Simulation', 'Video Processing')),
      wallet_address TEXT,
      wallet_address_secondary TEXT,
      status TEXT DEFAULT 'PENDING' NOT NULL,
      progress INTEGER DEFAULT 0 NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- Campos para links e anexos --
      cloud_link TEXT,
      script_path TEXT,
      external_links TEXT, -- Armazenado como JSON string
      transaction_hash TEXT,

      -- Requisitos de hardware e software --
      cpu BOOLEAN DEFAULT 0,
      gpu BOOLEAN DEFAULT 0,
      ram INTEGER,
      vram INTEGER,

      vray BOOLEAN DEFAULT 0,
      openfoam BOOLEAN DEFAULT 0,
      bullet BOOLEAN DEFAULT 0,
      python BOOLEAN DEFAULT 0,
      compileProject BOOLEAN DEFAULT 0,
      blender BOOLEAN DEFAULT 0,
      octane BOOLEAN DEFAULT 0,
      autoDesk3DMax BOOLEAN DEFAULT 0,
      zbrush BOOLEAN DEFAULT 0
      

    )`);

    // Nova tabela para gerenciar slugs temporários
    db.run(`CREATE TABLE IF NOT EXISTS job_claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    )`);

    // Limpa slugs expirados ao iniciar (boa prática)
    db.run(`DELETE FROM job_claims WHERE expires_at < CURRENT_TIMESTAMP`);

    // Passo 2: Verificar se a tabela está vazia e popular (Substitui o seed.ts)
    db.get('SELECT COUNT(*) as count FROM projects', (err, row) => {
      if (err) return console.error('Erro ao contar projetos:', err.message);
    });
  });
});

// --- As 3 funções de Query para sua API ---
// (Exatamente como na resposta anterior)

export const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
};

export const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};