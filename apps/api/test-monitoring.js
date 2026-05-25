const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

// Create token for teacher
const token = jwt.sign({ userId: 'cmo8j2de00002e44zrtuaot1x', role: 'TEACHER' }, 'supersecret');

fetch('http://localhost:3000/api/monitoring/overview', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log).catch(console.error);

fetch('http://localhost:3000/api/monitoring/students', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log).catch(console.error);
