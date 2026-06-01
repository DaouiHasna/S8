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
  app.listen(PORT, () => console.log(`[OK] API sur :${PORT}`));
}).catch(err => { console.error(err); process.exit(1); });

// ============ ENDPOINT 1: Search logs - VULNERABLE ============
app.post('/logs/search', async (req, res) => {
  try {
    const results = await db.collection('security_logs')
                            .find(req.body)    // ❌ DIRECTLY USING req.body!
                            .limit(20).toArray();
    res.json({ count: results.length, data: results });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ ENDPOINT 2: Login - VULNERABLE ============
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.collection('users')
                         .findOne({ username, password });  // ❌ password can be {"$ne":""}
    if (user) res.json({ success: true, message: `Bienvenue ${user.username}`, role: user.role });
    else res.status(401).json({ success: false, message: 'Identifiants incorrects' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
