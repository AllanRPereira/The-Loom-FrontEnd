import sqlite3 from 'sqlite3';

const verboseSqlite = sqlite3.verbose();
const DB_FILE = './the-loom-hackathon.db';

let db = null;

// Função para inicializar o banco de dados
function initDB() {
  if (db) return db;
  
  db = new verboseSqlite.Database(DB_FILE, (err) => {
    if (err) {
      console.error('Erro ao conectar ao banco de dados:', err.message);
      return;
    }
    console.log('Conectado ao banco de dados SQLite.');
    
    db.serialize(() => {
      // Criar tabela projects
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
        cloud_link TEXT,
        script_path TEXT,
        external_links TEXT,
        transaction_hash TEXT,
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

      // Criar tabela job_claims
      db.run(`CREATE TABLE IF NOT EXISTS job_claims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
      )`);

      // Limpar slugs expirados
      db.run(`DELETE FROM job_claims WHERE expires_at < CURRENT_TIMESTAMP`);
    });
  });
  
  return db;
}

// Inicializar DB apenas em runtime, não durante build
if (typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build') {
  initDB();
}

// Funções de query
export const runQuery = (sql, params = []) => {
  const database = db || initDB();
  return new Promise((resolve, reject) => {
    if (!database) {
      reject(new Error('Database not initialized'));
      return;
    }
    database.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const getQuery = (sql, params = []) => {
  const database = db || initDB();
  return new Promise((resolve, reject) => {
    if (!database) {
      reject(new Error('Database not initialized'));
      return;
    }
    database.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const allQuery = (sql, params = []) => {
  const database = db || initDB();
  return new Promise((resolve, reject) => {
    if (!database) {
      reject(new Error('Database not initialized'));
      return;
    }
    database.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
