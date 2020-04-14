import mapImage from '../assets/map/map.json';
import tilesetImage from '../assets/map/arcade_platformerV2-transparent.png';

import character from '../assets/characters/character.robot.png';
import characterXML from '../assets/characters/character.robot.xml';

import Player from '../entities/Player';

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

  // Add extruded tileset image.
  const tileset = map.addTilesetImage(
    'arcade_platformerV2-transparent',
    'platformer-tiles',
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
}

function update(time, delta) {}

export default {
  preload,
  create,
  update,
};
