var config = {
    type: Phaser.AUTO,
    width: 1150,
    height: 300,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 200},
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

    player = this.physics.add.sprite(100, 450, 'dude').setScale(2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 29, end: 30 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 20 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 29, end: 30 }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();
  }

  function update()
  {
    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
        player.setFlipX(true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
        player.setFlipX(false);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }
  }
