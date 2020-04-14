import background from '../assets/sprites/background.png';
import welcome from '../assets/sprites/welcome.png';
import gametitle from '../assets/sprites/start.png';
import startbutton from '../assets/sprites/startbutton.png';
import intro_music from '../assets/audio/01-opening.ogg';

function preload() {
  this.load.audio('intro_music', intro_music);
  this.load.image('background', background);
  this.load.image('welcome', welcome);
  this.load.image('gametitle', gametitle);
  this.load.image('startbutton', startbutton);
}
function create() {
  this.key = 'intro';

  /*==========================================
		= Audio
		============================================
		*/
  this.intro_music = this.sound.add('intro_music', {
    mute: false,
    volume: 0.2,
    loop: true,
  });
  this.intro_music.play();

  /*==========================================
		= Position GameObjects
		============================================
		*/

  this.background = this.add.image(0, -300, 'background').setOrigin(0, 0);
  this.welcome = this.add
    .image(this.game.config.width / 2, 430, 'welcome')
    .setAlpha(0);
  this.gametitle = this.add
    .image(this.game.config.width / 2, 450, 'gametitle')
    .setAlpha(0)
    .setScale(1);
  this.startbutton = this.add
    .image(this.game.config.width / 2, 550, 'startbutton')
    .setAlpha(0)
    .setScale(2.5);

  /*==========================================
		= Animate GameObjects
		============================================
		*/

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

  /*==========================================
		= Actions
		============================================
		*/
  this.keys = this.input.keyboard.addKeys('ENTER,SPACE');

  this.startbutton.setInteractive().on('pointerdown', () => {
    this.intro_music.stop();
    this.scene.start('game');
  });
}

function update() {}

export default {
  preload,
  create,
  update,
};
