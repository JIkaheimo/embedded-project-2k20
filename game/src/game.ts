import Phaser from 'phaser';

import PhaserMatterCollisionPlugin from 'phaser-matter-collision-plugin';

import gameScene from './scenes/game-scene';
import introScene from './scenes/intro';

// Fix to Matter + Phaser collision detection
// https://github.com/photonstorm/phaser/commit/d56a6c879056c09a1ec1e8e7b229ac60179acdce

// Physics configurations.
const physics: Phaser.Types.Core.PhysicsConfig = {
  default: 'matter',
  matter: {
    gravity: {
      y: 1, // default matter gravity.
    },
    debug: false,
  },
};

// Game world configurations.
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: Math.min(1024, window.innerWidth),
  height: Math.min(768, window.innerHeight),
  physics,
  fps: {
    target: 30,
    forceSetTimeOut: true,
  },
  plugins: {
    scene: [
      {
        plugin: PhaserMatterCollisionPlugin, // The plugin class
        key: 'matterCollision', // Where to store in Scene.Systems, e.g. scene.sys.matterCollision
        mapping: 'matterCollision', // Where to store in the Scene, e.g. scene.matterCollision
      },
    ],
  },
};

const game = new Phaser.Game(config);

game.scene.add('intro', introScene, true);
game.scene.add('game', gameScene);
