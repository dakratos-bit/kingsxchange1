const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'users.json');

function ensureDb() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function findUserByEmail(email) {
  const db = readDb();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

function findUserById(id) {
  const db = readDb();
  return db.users.find(u => u.id === id);
}

function createUser({ fullName, email, phone, passwordHash }) {
  const db = readDb();
  const user = {
    id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    fullName,
    email: email.toLowerCase(),
    phone,
    passwordHash,
    // Demo balances only — no real funds are held. Replace with a real
    // wallet ledger before this goes anywhere near actual users.
    balances: { ngn: 250000, btc: 0.015, eth: 0.42, usdt: 500 },
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  writeDb(db);
  return user;
}

module.exports = { findUserByEmail, findUserById, createUser };
