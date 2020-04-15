const path = require('path');
const cors = require('cors');
const express = require('express');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 5000;

let players = [];

// Enable cors.
app.use(cors());

// Enable static path for assets, scripts etc.
app.use(express.static(__dirname + '/public'));

// Serve game from root path.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

io.on('connection', (socket) => {
  let player = {
    id: socket.id,
    position: {
      x: 0,
      y: 0,
    },
    velocity: {
      x: 0,
      y: 0,
    },
  };

  console.log('a user connected');

  socket.on('move', (data) => {
    console.log(data);
  });

  socket.on('new player', (position, velocity) => {
    console.log('Player connected');
    // Create new player object.
    player = { ...player, position, velocity };
    // Send other players to the client.
    socket.emit('init players', players);
    // Add player to server-tracked players.
    players = [...players, player];
    // Broadcast the player to other clients.
    socket.broadcast.emit('new player', player);
  });

  socket.on('player update', (position, velocity) => {
    // Update player position and velocity
    player = { ...player, position, velocity };
    // Broadcast new data to other clients.
    socket.broadcast.emit('player update', player);
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected.');
    // Remove player from server-tracked players.
    players = players.filter(({ id }) => id != socket.id);
    // Remove player with the id from other clients.
    socket.broadcast.emit('remove player', socket.id);
  });
});

http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}.`);
});
