import Phaser from 'phaser';

// Fix to Matter + Phaser collision detection
// https://github.com/photonstorm/phaser/commit/d56a6c879056c09a1ec1e8e7b229ac60179acdce

import backgroundImage from './backgrounds.png';
import mapImage from './map.json';
import tilesetImage from './spritesheet-extruded.png';
import character from './characters/Zombie/Tilesheet/character_zombie_sheetHD.png';
import characterXML from './characters/Zombie/Tilesheet/character_zombie_sheetHD.xml';
import Player from './Player';

const BASE_LAYER = 'Base';
const LADDER_LAYER = 'Ladders';

const physics = {
  default: 'matter',
  matter: {
    gravity: {
      y: 1,
    },
    enableSleep: true,
    debug: true,
  },
};

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  pixelArt: true,
  physics,
  scene: {
    preload,
    create,
    update,
  },
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
};

const game = new Phaser.Game(config);

function preload() {
  /** PRELOAD GRAPHICS **/

  // Load background images.
  this.load.image('backgrounds', backgroundImage);
  // Load platformer tileset.
  this.load.image('platformer-tiles', tilesetImage);
  // Load map.
  this.load.tilemapTiledJSON('map', mapImage);
  // Load player sprites.
  this.load.atlasXML('player', character, characterXML);
}

function create() {
  // Add background image.
  this.add.image(0, 0, 'backgrounds').setScale(15).setOrigin(0, 0);

  // Create map.
  const map = this.make.tilemap({ key: 'map' });

  // Add extruded tileset image.
  const tileset = map.addTilesetImage(
    'spritesheet',
    'platformer-tiles',
    23,
    23,
    1,
    2,
  );

  // Get layers from map.
  const baseLayer = map.createStaticLayer(BASE_LAYER, tileset, 0, 0);
  const ladderLayer = map.createStaticLayer(LADDER_LAYER, tileset, 0, 0);

  // Set colliding tiles before converting the layers to Matter bodies.
  baseLayer.setCollisionByProperty({ collides: true });

  // Get the layers registered with Matter. Any colliding tiles will be given a Matter body.
  // The collision shapes haven't been mapped in Tiled so each colliding tile will get
  // a default rectangle body.
  this.matter.world.convertTilemapLayer(baseLayer);

  // Randomize player spawn.
  const spawns = map.getObjectLayer('Objects')['objects'];
  const spawn = spawns[Math.floor(Math.random() * spawns.length)];

  this.player = new Player(this, spawn.x, spawn.y);

  // Setup arrow keys to controlthe game.
  this.controls = this.input.keyboard.createCursorKeys();

  /** CAMERA **/

  // Setup camera to follow player.
  const playerCamera = this.cameras.main;

  playerCamera.startFollow(this.player.sprite, false, 0.5, 0.5);
  playerCamera.setZoom(1.5);
  playerCamera.roundPixels = true;

  // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap.
  playerCamera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  //this.matter.world.createDebugGraphic();
}

function update(time, delta) {}
