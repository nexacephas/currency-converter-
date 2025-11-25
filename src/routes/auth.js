const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


// NOTE: This is a simple demo login. In real apps use DB.
const demoUsers = [
{ id: 1, username: 'admin', password: bcrypt.hashSync('admin123', 8), role: 'admin' },
{ id: 2, username: 'user', password: bcrypt.hashSync('user123', 8), role: 'user' },
];


router.post('/login', (req, res) => {
const { username, password } = req.body;
const user = demoUsers.find(u => u.username === username);
if (!user) return res.status(401).json({ error: 'Invalid credentials' });
const ok = bcrypt.compareSync(password, user.password);
if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
const token = jwt.sign({ sub: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'shh', { expiresIn: '1h' });
res.json({ token });
});


module.exports = router;