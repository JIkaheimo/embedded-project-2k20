import mapImage from '../assets/map/map.json';
import tilesetImage from '../assets/map/platformer-extruded.png';

import character from '../assets/characters/character.robot.png';
import characterXML from '../assets/characters/character.robot.xml';

import Player from '../entities/Player';

import io from 'socket.io-client';
import { ScaleModes } from 'phaser';

const BACKGROUND_LAYER = 'background';
const BASE_LAYER = 'terrain';
const GRASS_LAYER = 'grass';

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
  grassLayer.setDepth(3);
  //const ladderLayer = map.createStaticLayer(LADDER_LAYER, tileset, 0, 0);

  // Set colliding tiles before converting the layers to Matter bodies.
  baseLayer.setCollisionByProperty({ collides: true });

  // Get the layers registered with Matter. Any colliding tiles will be given a Matter body.
  // The collision shapes haven't been mapped in Tiled so each colliding tile will get
  // a default rectangle body.
  this.matter.world.convertTilemapLayer(baseLayer);

  console.log(this.matter.world.localWorld.bodies);

  this.otherPlayers = {};

  // Randomize player spawn.
  const spawns = map.getObjectLayer('spawns')['objects'];
  const spawn = spawns[Math.floor(Math.random() * spawns.length)];

  this.player = new Player(this, spawn.x, spawn.y);

  // Setup arrow keys to controlthe game.
  this.controls = this.input.keyboard.createCursorKeys();

  /** CAMERA **/

  // Setup camera to follow player.
  const playerCamera = this.cameras.main;

  playerCamera.startFollow(this.player.sprite, false, 0.5, 0.5);
  playerCamera.setZoom(3);
  playerCamera.roundPixels = true;

  // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap.
  playerCamera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  //this.matter.world.createDebugGraphic();

  this.time.addEvent({
    delay: 50,
    callback: sendPlayerData,
    callbackScope: this,
    loop: true,
  });

  const scene = this;

  this.serverSocket.on('new player', function ({ id, position: { x, y } }) {
    // Add player model.
    console.log(x, y);
    scene.otherPlayers[id] = new Player(scene, x, y, false);
  });

  this.serverSocket.on('init players', function (players) {
    for (let player of players) {
      console.log(player);
      scene.otherPlayers[player.id] = new Player(
        scene,
        player.position.x,
        player.position.y,
        false,
      );
    }
  });

  this.serverSocket.on('remove player', function (id) {
    // Remove player model.
    scene.otherPlayers[id].sprite.destroy();
    delete scene.otherPlayers[id];
  });

  this.serverSocket.on('player update', function ({ id, position, velocity }) {
    if (scene.otherPlayers[id]) {
      scene.otherPlayers[id].sprite.setPosition(position.x, position.y);
      scene.otherPlayers[id].sprite.setVelocity(velocity.x, velocity.y);
    }
  });

  this.serverSocket.emit('new player', this.player.sprite.body.position);
}

function update(time, delta) {}

function sendPlayerData() {
  const { position, velocity } = this.player.sprite.body;
  this.serverSocket.emit('player update', position, velocity);
}

export default {
  preload,
  create,
  update,
};
