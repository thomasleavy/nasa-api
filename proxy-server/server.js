const express = require('express');
const request = require('request');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors());

app.get('/proxy', (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send('No URL provided.');
  }

  request({ url, encoding: null }, (err, response, body) => {
    if (err) {
      return res.status(500).send('Error fetching the image.');
    }

    res.set('Content-Type', response.headers['content-type']);
    res.send(body);
  });
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
