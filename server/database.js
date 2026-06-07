import fs from 'fs';
import { seedAll } from './seed.js';

const DB_PATH = './miaoshou-data.json';

// Load or create database
let data;
if (fs.existsSync(DB_PATH)) {
  data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  console.log('Database loaded from disk');
} else {
  data = seedAll();
  save();
  console.log('Database seeded');
}

function save() {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Simple query helpers
const db = {
  _data: data,

  save,

  all(table, where = {}) {
    let rows = [...(data[table] || [])];
    for (const [k, v] of Object.entries(where)) {
      rows = rows.filter(r => r[k] === v);
    }
    return rows;
  },

  get(table, id) {
    if (typeof id === 'object') {
      return (data[table] || []).find(r => Object.entries(id).every(([k, v]) => r[k] === v));
    }
    return (data[table] || []).find(r => r.id === id);
  },

  insert(table, row) {
    if (!data[table]) data[table] = [];
    const id = (data[table].length > 0 ? Math.max(...data[table].map(r => r.id || 0)) : 0) + 1;
    const record = { id, ...row };
    data[table].push(record);
    save();
    return record;
  },

  update(table, id, updates) {
    const idx = data[table].findIndex(r => r.id === id);
    if (idx === -1) return null;
    data[table][idx] = { ...data[table][idx], ...updates };
    save();
    return data[table][idx];
  },

  delete(table, id) {
    const idx = data[table].findIndex(r => r.id === id);
    if (idx === -1) return false;
    data[table].splice(idx, 1);
    save();
    return true;
  },

  q(sql) {
    // Simple query parser for common patterns
    // Returns { all: fn, get: fn, run: fn } mock interface
    const tableName = sql.match(/FROM\s+(\w+)/i)?.[1];
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|$)/is);
    const orderMatch = sql.match(/ORDER BY\s+(\w+)\s*(ASC|DESC)?/i);
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);

    return {
      all(...params) {
        let rows = [...(data[tableName] || [])];
        if (whereMatch && params.length) {
          rows = rows.filter(r => {
            let match = true;
            const conditions = whereMatch[1];
            const andParts = conditions.split(/\s+AND\s+/i);
            let pi = 0;
            for (const part of andParts) {
              if (part.includes('=?')) {
                const col = part.split('=')[0].trim();
                if (r[col] != params[pi]) match = false;
                pi++;
              } else if (part.includes('LIKE ?')) {
                const col = part.split('LIKE')[0].trim();
                const pattern = params[pi].replace(/%/g, '');
                if (!r[col]?.includes(pattern)) match = false;
                pi++;
              } else if (part.includes('IN (')) {
                // IN clause — skip params for now
                pi += (part.match(/\?/g) || []).length;
              }
            }
            return match;
          });
        }
        if (orderMatch) {
          const [col, dir] = [orderMatch[1], orderMatch[2] || 'ASC'];
          rows.sort((a, b) => dir === 'DESC' ? (b[col] || 0) - (a[col] || 0) : (a[col] || 0) - (b[col] || 0));
        }
        if (limitMatch) rows = rows.slice(0, +limitMatch[1]);
        return rows;
      },
      get(...params) { return this.all(...params)[0] || null; },
      run(...params) { return null; }, // handled separately
    };
  }
};

export default db;
