const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, findUserById, createUser } = require('../db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-this-in-production';
const TOKEN_EXPIRY = '7d';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidNgPhone(phone) {
  // Expects the full international format, e.g. +2348012345678
  const digitsOnly = (phone || '').replace(/\D/g, '');
  return /^234\d{10}$/.test(digitsOnly);
}

function setAuthCookie(res, user) {
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  res.cookie('kx_session', token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: COOKIE_MAX_AGE,
  });
}

function publicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    balances: user.balances || { ngn: 0, btc: 0, eth: 0, usdt: 0 },
  };
}

// POST /api/signup
router.post('/signup', async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !fullName.trim()) {
    return res.status(400).json({ error: 'Full name is required.' });
  }
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (!phone || !isValidNgPhone(phone)) {
    return res.status(400).json({ error: 'Enter a valid Nigerian phone number.' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }
  if (findUserByEmail(email)) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = createUser({ fullName: fullName.trim(), email, phone, passwordHash });

  setAuthCookie(res, user);
  res.status(201).json({ user: publicUser(user) });
});

// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  setAuthCookie(res, user);
  res.json({ user: publicUser(user) });
});

// POST /api/logout
router.post('/logout', (req, res) => {
  res.clearCookie('kx_session');
  res.json({ ok: true });
});

// GET /api/me — returns the logged-in user based on the session cookie
router.get('/me', (req, res) => {
  const token = req.cookies.kx_session;
  if (!token) return res.status(401).json({ error: 'Not logged in.' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = findUserById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Not logged in.' });
    res.json({ user: publicUser(user) });
  } catch (err) {
    res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
});

module.exports = router;
