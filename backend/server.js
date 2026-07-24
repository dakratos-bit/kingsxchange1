require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// In production, set FRONTEND_ORIGIN to your real site's URL (e.g. https://kingsxchange.ng)
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5500',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api', authRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Kingsxchange auth backend running on http://localhost:${PORT}`);
});
