import mapImage from '../assets/map/map.json';
import tilesetImage from '../assets/map/platformer-extruded.png';

import character from '../assets/characters/character.robot.png';
import characterXML from '../assets/characters/character.robot.xml';

import Player from '../entities/Player';

import io from 'socket.io-client';

import ControlledPlayer from '../entities/ControlledPlayer';

const BACKGROUND_LAYER = 'background';
const BASE_LAYER = 'terrain';
const GRASS_LAYER = 'grass';
const TREE_LAYER = 'trees';
const TREE_BG_LAYER = 'treesbg';

function init({ isSpectator }) {
  this.isSpectator = isSpectator;
}

function preload() {
  /** PRELOAD GRAPHICS **/

  // Load platformer tileset.
  this.load.image('platformer-tiles', tilesetImage);
  // Load map.
  this.load.tilemapTiledJSON('map', mapImage);
  // Load player sprites.
  this.load.atlasXML('player', character, characterXML);
}

function create() {
  // Create map.
  const map = this.make.tilemap({ key: 'map' });

  this.serverSocket = io();

  // Add extruded tileset image.
  const tileset = map.addTilesetImage(
    'arcade_platformerV2-transparent',
    'platformer-tiles',
    16,
    16,
    1,
    2,
  );

  // Get layers from map.
  const backgroundLayer = map.createStaticLayer(
    BACKGROUND_LAYER,
    tileset,
    0,
    0,
  );

  const baseLayer = map.createStaticLayer(BASE_LAYER, tileset, 0, 0);

  const grassLayer = map.createStaticLayer(GRASS_LAYER, tileset, 0, 0);
  const treesLayer = map.createStaticLayer(TREE_LAYER, tileset, 0, 0);
  const treesBgLayer = map.createStaticLayer(TREE_BG_LAYER, tileset, 0, 0);

  baseLayer.setDepth(4);
  grassLayer.setDepth(3);
  treesLayer.setDepth(2);
  treesBgLayer.setDepth(0);
  //const ladderLayer = map.createStaticLayer(LADDER_LAYER, tileset, 0, 0);

  this.map = map;

  this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  // Set colliding tiles before converting the layers to Matter bodies.
  baseLayer.setCollisionByProperty({ collides: true });

  // Get the layers registered with Matter. Any colliding tiles will be given a Matter body.
  // The collision shapes haven't been mapped in Tiled so each colliding tile will get
  // a default rectangle body.
  this.matter.world.convertTilemapLayer(baseLayer);

  this.otherPlayers = {};

  if (this.isSpectator) {
    initSpectator(this);
  } else {
    initPlayer(this);

    this.serverSocket.on('init players', function (players) {
      addPlayers(scene, players);
    });
  }

  const scene = this;

  this.serverSocket.on('new player', function ({ id, position: { x, y } }) {
    // Add player model.
    scene.otherPlayers[id] = new Player(scene, x, y);
  });

  this.serverSocket.on('remove player', function (id) {
    // Remove player model.
    scene.otherPlayers[id].destroy();
    delete scene.otherPlayers[id];
  });

  this.serverSocket.on('player update', function ({
    id,
    position,
    velocity,
    movementState,
  }) {
    if (scene.otherPlayers[id]) {
      // Get the updated player.
      const player = scene.otherPlayers[id];

      // Update player.
      player.setPosition(position.x, position.y);
      player.updateState(movementState);
      player.updateVelocity(velocity);
    }
  });
}

function update(time, delta) {}

function sendPlayerData() {
  const { movementState } = this.player;
  const { position, velocity } = this.player.body;

  this.serverSocket.emit('player update', {
    position,
    velocity,
    movementState,
  });
}

function initSpectator(scene) {
  scene.serverSocket.on('init players', function (players) {
    addPlayers(scene, players);

    const spectatorCamera = scene.cameras.main;
    spectatorCamera.startFollow(
      scene.otherPlayers[players[0].id],
      false,
      0.5,
      0.5,
    );

    spectatorCamera.setZoom(3);
    spectatorCamera.roundPixels = true;

    // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap.
  });

  scene.serverSocket.emit('new spectator');
}

function addPlayers(scene, players) {
  for (let player of players) {
    scene.otherPlayers[player.id] = new Player(
      scene,
      player.position.x,
      player.position.y,
    );
  }
}

function initPlayer(scene) {
  // Randomize player spawn.
  const spawns = scene.map.getObjectLayer('spawns')['objects'];

  const spawn = spawns[Math.floor(Math.random() * (spawns.length - 1))];

  // Spawn the player.
  scene.player = new ControlledPlayer(scene, spawn.x, spawn.y);

  // Allow controlling.
  scene.controls = scene.input.keyboard.createCursorKeys();
  scene.keys = scene.input.keyboard.addKeys('A,B,C,D,E');

  /** CAMERA **/

  // Setup camera to follow player.
  const playerCamera = scene.cameras.main;

  playerCamera.startFollow(scene.player, false, 0.5, 0.5);
  playerCamera.setZoom(3);
  playerCamera.roundPixels = true;

  // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap.

  console.log(scene.player);
  scene.serverSocket.emit('new player', scene.player.body.position);

  scene.time.addEvent({
    delay: 40,
    callback: sendPlayerData,
    callbackScope: scene,
    loop: true,
  });
}

export default {
  init,
  preload,
  create,
  update,
};
