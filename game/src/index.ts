import Phaser from 'phaser';

const game = new Phaser.Game({
  width: 800,
  height: 400,
  scene: {
    preload: function() {
      this.load.image('background', 'assets/backgrounds.png');
    },

    create: function() {},

    update: function() {},
  },
});
