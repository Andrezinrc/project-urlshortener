require('dotenv').config();
const express = require('express');
const cors = require('cors');
const validUrl = require('valid-url');
const dns = require('dns');
const shortid = require('shortid');

const app = express();
const port = process.env.PORT || 3000;

// In-memory storage for URLs
const urlDatabase = {};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;
  if (!validUrl.isUri(url)) {
    return res.json({ error: 'invalid url' });
  }

  const urlParts = new URL(url);
  dns.lookup(urlParts.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    const short = shortid.generate();
    urlDatabase[short] = url;
    res.json({ original_url: url, short_url: short });
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const { short_url } = req.params;

  const originalUrl = urlDatabase[short_url];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'invalid url' });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
