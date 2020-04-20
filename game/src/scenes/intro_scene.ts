import background from '../assets/sprites/background.png';

import welcome from '../assets/sprites/welcome.png';
import game_title from '../assets/sprites/start.png';

import start_button from '../assets/sprites/startbutton.png';
import spectate_button from '../assets/sprites/spectatebutton.png';

import intro_music from '../assets/audio/01-opening.ogg';

function preload() {
  // Audio
  this.load.audio('intro_music', intro_music);
  // Background
  this.load.image('background', background);
  // Texts
  this.load.image('welcome', welcome);
  this.load.image('game_title', game_title);
  // Buttons
  this.load.image('start_button', start_button);
  this.load.image('spectate_button', spectate_button);
}

function create() {
  this.key = 'intro';

  this.intro_music = this.sound.add('intro_music', {
    mute: false,
    volume: 0.2,
    loop: true,
  });
  this.intro_music.play();

  this.add.image(0, -300, 'background').setOrigin(0, 0);

  const center = this.game.config.width / 2;

  const sprites = this.add.group({ key: 'sprites' });

  const startButton = this.add.image(center, 160, 'start_button');
  const spectateButton = this.add.image(center, 240, 'spectate_button');

  sprites.addMultiple([
    this.add.image(center, 30, 'welcome'),
    this.add.image(center, 2 * 30, 'game_title'),
    startButton.setScale(0.5),
    spectateButton.setScale(0.5),
  ]);

  // Add menu animations.
  sprites.getChildren().forEach((child) => {
    this.tweens.timeline({
      targets: child,

      tweens: [
        // Vertical float animation
        {
          y: child.y + 10,
          ease: 'Linear',
          duration: 1500,
          repeat: -1,
          yoyo: true,
        },
      ],
    });
  });

  /*
  this.welcomeTween = this.tweens.timeline({
    targets: this.welcome,
    ease: 'Linear',
    loop: 0,
    tweens: [
      {
        y: 280,
        alpha: 1,
        ease: 'Linear',
        duration: 1000,
        delay: 0,
        repeat: 0,
      },
      {
        y: 290,
        alpha: 1,
        ease: 'Linear',
        duration: 600,
        delay: 0,
        repeat: -1,
        yoyo: true,
      },
    ],
  });

  this.gametitleTween = this.tweens.timeline({
    targets: this.gametitle,
    ease: 'Linear',
    loop: 0,
    tweens: [
      {
        y: 280,
        alpha: 1,
        ease: 'Linear',
        duration: 1000,
        delay: 0,
        repeat: 0,
      },
      {
        y: 290,
        alpha: 1,
        ease: 'Linear',
        duration: 600,
        delay: 0,
        repeat: -1,
        yoyo: true,
      },
    ],
  });

  this.startbuttonTween = this.tweens.timeline({
    targets: this.startbutton,
    ease: 'Linear',
    loop: 0,
    tweens: [
      {
        y: 380,
        alpha: 1,
        ease: 'Linear',
        duration: 1000,
        delay: 0,
        repeat: 0,
      },
      {
        y: 390,
        alpha: 1,
        ease: 'Linear',
        duration: 600,
        delay: 0,
        repeat: -1,
        yoyo: true,
      },
    ],
  });
  */

  /*==========================================
		= Actions
		============================================
    */

  this.keys = this.input.keyboard.addKeys('ENTER,SPACE,D');

  // Play the game.
  startButton.setInteractive().on('pointerdown', () => {
    this.intro_music.stop();
    this.scene.start('game', { isSpectator: false });
  });

  // Spectate the game.
  spectateButton.setInteractive().on('pointerdown', () => {
    this.intro_music.stop();
    this.scene.start('game', { isSpectator: true });
  });
}

export default {
  preload,
  create,
};
