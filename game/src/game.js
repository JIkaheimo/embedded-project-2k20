import Phaser from 'phaser';

import gameScene from './scenes/game-scene';
import introScene from './scenes/intro';

// Fix to Matter + Phaser collision detection
// https://github.com/photonstorm/phaser/commit/d56a6c879056c09a1ec1e8e7b229ac60179acdce

const physics = {
  default: 'matter',
  matter: {
    gravity: {
      y: 1,
    },
    enableSleep: true,
    debug: true,
    wireframes: false,
  },
};

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  pixelArt: true,
  physics,
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
};

const game = new Phaser.Game(config);

game.scene.add('intro', introScene, true);
game.scene.add('game', gameScene);
