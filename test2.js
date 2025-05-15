const http = require('http');
const { parse } = require('querystring');
const port = process.env.PORT || 3000;

// In-memory database
let users = [
  { id: 1, user: 'wolf', code: '1234', key: 'sec1' }
];
let idCounter = 2;

function renderPage() {
  const rows = users.map(u => `
    <tr>
      <td>${u.user}</td>
      <td>${u.code}</td>
      <td>${u.key}</td>
      <td>
        <form method="POST" style="display:inline;">
          <input type="hidden" name="action" value="delete">
          <input type="hidden" name="id" value="${u.id}">
          <button>Delete</button>
        </form>
        <form method="POST" style="display:inline;">
          <input type="hidden" name="action" value="edit">
          <input type="hidden" name="id" value="${u.id}">
          <input name="user" value="${u.user}" required>
          <input name="code" value="${u.code}" required>
          <input name="key" value="${u.key}" required>
          <button>Update</button>
        </form>
      </td>
    </tr>
  `).join('');

  return `
    <html>
      <head>
        <title>Database UI</title>
        <style>
          body { font-family: monospace; background: #121212; color: #f0f0f0; padding: 20px; }
          table, th, td { border: 1px solid white; border-collapse: collapse; padding: 8px; }
          th { background: #222; }
          input, button { margin: 2px; }
        </style>
      </head>
      <body>
        <h2>User | Code | Key</h2>
        <table>
          <tr><th>User</th><th>Code</th><th>Key</th><th>Actions</th></tr>
          ${rows}
        </table>
        <h3>Add New Entry</h3>
        <form method="POST">
          <input type="hidden" name="action" value="add">
          <input name="user" placeholder="User" required>
          <input name="code" placeholder="Code" required>
          <input name="key" placeholder="Key" required>
          <button>Add</button>
        </form>
      </body>
    </html>
  `;
}

http.createServer((req, res) => {
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderPage());
  } else if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = parse(body);
      const { action, id, user, code, key } = data;

      if (action === 'add') {
        users.push({ id: idCounter++, user, code, key });
      } else if (action === 'delete' && id) {
        users = users.filter(u => u.id !== parseInt(id));
      } else if (action === 'edit' && id) {
        const index = users.findIndex(u => u.id === parseInt(id));
        if (index !== -1) {
          users[index] = { id: parseInt(id), user, code, key };
        }
      }

      res.writeHead(302, { Location: '/' });
      res.end();
    });
  } else {
    res.writeHead(405);
    res.end('Method Not Allowed');
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`Server started on http://localhost:${port}`);
});
