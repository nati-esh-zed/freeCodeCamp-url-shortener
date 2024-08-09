
require('dotenv').config();
const { URL } = require('url');
const dns = require('dns');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

let topId = 20510;
const shortenedUrls = new Map();
const reverseUrlMap = new Map();

app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/api/shorturl', function (req, res) {
  const url = req.body.url;
  if (reverseUrlMap.has(url)) {
    const shortUrl = reverseUrlMap.get(url);
    return res.json({
      original_url: url,
      short_url: shortUrl
    });
  }
  const hostname = new URL(url).hostname;
  dns.lookup(hostname, (err, address) => {
    if (err) {
      console.error(err);
      return res.json({
        error: "Invalid Hostname"
      });
    } else {
      const shortUrl = `${++topId}`;
      reverseUrlMap.set(url, shortUrl);
      shortenedUrls.set(shortUrl, url);
      return res.json({
        original_url: url,
        short_url: shortUrl
      });
    }
  });
});

app.get('/api/shorturl/:shortUrl', function (req, res) {
  const shortUrl = req.params.shortUrl;
  if (!shortenedUrls.has(shortUrl)) {
    return res.json({
      error: "No short URL found for the given input"
    });
  } else {
    const originalUrl = shortenedUrls.get(shortUrl);
    return res.redirect(originalUrl)
  }
});

app.get('/', function (req, res) {
  return res.sendFile(__dirname + '/views/index.html');
});

app.use(express.static('public'));

const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('listening on port ' + listener.address().port);
});
