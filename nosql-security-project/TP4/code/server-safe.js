const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = 3000;
const URI = 'mongodb://admin:secret@localhost:27017/soc_lite?authSource=admin';

app.use(express.json());
let db;

MongoClient.connect(URI).then(client => {
  db = client.db('soc_lite');
  console.log('[OK] Connecte a MongoDB');
  app.listen(PORT, () => console.log(`[OK] API securisee sur :${PORT}`));
}).catch(err => { console.error(err); process.exit(1); });

// ============ SECURITY HELPERS ============

function isCleanString(val) {
  if (typeof val !== 'string') return false;
  if (val.trim().length === 0) return false;
  if (val.length > 100) return false;
  return true;
}

function isValidIPv4(val) {
  if (typeof val !== 'string') return false;
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(val) &&
         val.split('.').every(n => +n <= 255);
}

const ALLOWED_STATUSES = ['open', 'closed', 'investigating'];

// ============ SECURE ENDPOINTS ============

// SECURE: /logs/search
app.post('/logs/search', async (req, res) => {
  const safeFilter = {};

  if (req.body.src_ip !== undefined) {
    if (!isValidIPv4(req.body.src_ip))
      return res.status(400).json({ error: 'src_ip invalide — format IPv4 requis' });
    safeFilter.src_ip = req.body.src_ip;
  }

  if (req.body.action !== undefined) {
    if (!isCleanString(req.body.action))
      return res.status(400).json({ error: 'action invalide' });
    safeFilter.action = req.body.action;
  }

  if (req.body.status !== undefined) {
    if (!ALLOWED_STATUSES.includes(req.body.status))
      return res.status(400).json({ error: 'status non autorise' });
    safeFilter.status = req.body.status;
  }

  try {
    const results = await db.collection('security_logs')
                            .find(safeFilter)
                            .project({ _id: 0, ts: 1, src_ip: 1, action: 1, status: 1 })
                            .limit(20)
                            .toArray();
    res.json({ count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// SECURE: /auth/login
app.post('/auth/login', async (req, res) => {
  if (typeof req.body.username !== 'string' || typeof req.body.password !== 'string')
    return res.status(400).json({ error: 'username et password doivent etre des chaines' });

  const username = req.body.username.trim();
  const password = req.body.password;

  if (!isCleanString(username) || password.length === 0)
    return res.status(400).json({ error: 'Entree invalide' });

  try {
    const user = await db.collection('users').findOne(
      { username },
      { projection: { _id: 0, username: 1, password: 1, role: 1 } }
    );

    if (!user || user.password !== password)
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });

    res.json({ success: true, message: `Bienvenue ${user.username}`, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============ SECURE: /users/update-email ============
app.post('/users/update-email', async (req, res) => {
  if (typeof req.body.email !== 'string')
    return res.status(400).json({ error: 'email doit etre une chaine' });

  const email = req.body.email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ error: 'format email invalide' });

  const allowedFields = ['email', 'username'];
  const receivedFields = Object.keys(req.body);
  const hasExtraFields = receivedFields.some(field => !allowedFields.includes(field));
  if (hasExtraFields)
    return res.status(400).json({ error: 'champs non autorises detectes' });

  if (typeof req.body.username !== 'string' || req.body.username.trim().length === 0)
    return res.status(400).json({ error: 'username invalide' });

  try {
    const result = await db.collection('users').updateOne(
      { username: req.body.username.trim() },
      { $set: { email: email } }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ error: 'utilisateur non trouve' });

    res.json({ success: true, message: 'Email mis a jour', email: email });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
