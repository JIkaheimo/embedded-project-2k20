var config = {
    type: Phaser.AUTO,
    width: 1150,
    height: 300,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 600},
        debug: false
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };

  var player;
  var platforms;
  var cursors;

  var game = new Phaser.Game(config);

  function preload()
  {
    this.load.image('background', '../public/assets/backgrounds.png');
    this.load.spritesheet('dude', '../public/assets/spritesheet.png', { frameWidth: 23, frameHeight: 23 });
  }

  function create()
  {
    this.add.image(0, 0, 'background').setScale(5).setOrigin(0, 0);

    platforms = this.physics.add.staticGroup();
    platforms.create(100, 280, null).setScale(5).refreshBody();

    player = this.physics.add.sprite(100, 150, 'dude').setScale(2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 28, end: 29 }),
        frameRate: 10,
        repeat: -1,
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 19 } ],
        frameRate: 10
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 28, end: 29 }),
        frameRate: 10,
        repeat: -1,
    });

    this.anims.create({
        key: 'jump',
        frames: [ { key: 'dude', frame: 21 } ],
        frameRate: 10
    });

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(player, platforms);
  }

  function update()
  {
    if (cursors.left.isDown) {
        player.setVelocityX(-160);

        if (player.body.touching.down) {
          player.anims.play('left', true);
        }
        else {
          player.anims.play('jump');
        }
        player.setFlipX(true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);

        if (player.body.touching.down) {
          player.anims.play('right', true);
        }
        else {
          player.anims.play('jump');
        }
        player.setFlipX(false);
    }
    else if (player.body.touching.down) {
        player.setVelocityX(0);

        player.anims.play('turn');
    }
    else {
      player.setVelocityX(0);
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }
  }
