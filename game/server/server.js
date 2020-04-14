const path = require('path');
const cors = require('cors');
const express = require('express');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Enable cors.
app.use(cors());

// Enable static path for assets, scripts etc.
app.use(express.static(__dirname + '/public'));

// Serve game from root path.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('move', (data) => {
    console.log(data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(5000, () => {
  console.log('Listening on port 5000.');
});
