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

// Serve gane for controller.
app.get('/c', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/game_for_controller.html'));
});

io.on('connection', (socket) => {
  // Create new initial player.
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
    movementState: 0,
  };

  socket.on('new spectator', () => {
    // Spectator only needs players.
    socket.emit('init players', players);
  });

  socket.on('new player', (position, velocity) => {
    // Create new player object.
    player = { ...player, position, velocity };
    // Send other players to the client.
    socket.emit('init players', players);
    // Add player to server-tracked players.
    players = [...players, player];
    // Broadcast the player to other clients.
    socket.broadcast.emit('new player', player);
  });

  socket.on('player update', ({ position, velocity, movementState }) => {
    // Update player position and velocity
    player = { ...player, position, velocity, movementState };
    // Broadcast new data to other clients.
    socket.broadcast.emit('player update', player);
  });

  socket.on('disconnect', () => {
    // Remove player from server-tracked players.
    players = players.filter(({ id }) => id != socket.id);
    // Remove player with the id from other clients.
    socket.broadcast.emit('remove player', socket.id);
  });
});

http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}.`);
});
