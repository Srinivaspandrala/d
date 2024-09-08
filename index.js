const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

const db = new sqlite3.Database('./blogs.db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../server/build')));

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS posts1 (id INTEGER PRIMARY KEY, title TEXT, content TEXT, image_url TEXT,Description TEXT,videourl TEXT,author TEXT,date DATE	)");
});


// API Routes
app.get('/posts', (req, res) => {
  db.all('SELECT * FROM posts1', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ posts: rows });
  });
});

app.get('/posts/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM posts1 WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json({ post: row });
  });
});

app.post('/posts', (req, res) => {
  const { title, content, image_url,Description,videourl,author,date} = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }
  const query = 'INSERT INTO posts1 (title, content, image_url,Description,videourl,author,date) VALUES (?, ?, ?,?,?,?,?)';
  db.run(query, [title, content, image_url,Description,videourl,author,date], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID });
  });
});

app.put('/posts/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, image_url } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }

  const query = 'UPDATE posts SET title = ?, content = ?, image_url = ? WHERE id = ?';
  db.run(query, [title, content, image_url, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json({ message: 'Post updated' });
  });
});

app.delete('/posts/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM posts WHERE id = ?';
  db.run(query, [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json({ message: 'Post deleted' });
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
