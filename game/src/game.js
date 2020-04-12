var config = {
    type: Phaser.AUTO,
    width: 1150,
    height: 300,
    scene: {
      preload: preload,
      create: create,
      update: update,
      physics: {
        arcade: {
            gravity: { y: 600 },
            debug: false
        },
        matter: {
          debug: false
        }
      }
  }
  };

  var game = new Phaser.Game(config);

  function preload()
  {
    this.load.image('background', '../public/assets/backgrounds.png');
    this.load.spritesheet('spritesheet', '../public/assets/spritesheet.png', { frameWidth: 23, frameHeight: 23 });

    this.load.image("tiles", "../public/assets/spritesheet.png");
    this.load.tilemapTiledJSON("map", "map.json");

    this.load.image('platform', '../public/assets/platform.png');
  }

  function create()
  {
    this.add.image(0, 0, 'background').setScale(5).setOrigin(0, 0);

    /*
    const map = this.make.tilemap({ key: 'map' });

    const tileset = map.addTilesetImage("spritesheet", "tiles");
    const testLayer = map.createStaticLayer('Tile Layer 1', tileset, 0, 0);
    */

    //arade physics
    platforms = this.physics.add.staticGroup();
    platforms.create(0, 280, 'platform').setScale(3).setOrigin(0).refreshBody();
    platforms.create(250, 150, 'platform');

    player = this.physics.add.sprite(100, 100, 'spritesheet', 19).setScale(2);
    player.setBounce(0.3);
    player.setCollideWorldBounds(true);

    objects = this.physics.add.group();

    box = objects.create(150, 100, 'spritesheet', 190)
    box.setScale(2);
    box.setBounce(0.2);
    box.setCollideWorldBounds(true);

    ball = objects.create(200, 100, 'spritesheet', 234)
    ball.setScale(2);
    ball.setBounce(0.2);
    ball.setCollideWorldBounds(true);
    ball.setCircle(11);

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player, objects);
    this.physics.add.collider(objects, platforms);
    this.physics.add.collider(objects, objects);

    //matter physics
    /*
    this.matter.world.setBounds();

    player = this.matter.add.sprite(100, 100, 'spritesheet', 19);
    */

    //testLayer.setCollisionByExclusion([-1]);
    //this.physics.add.collider(player, testLayer);

    //camera
    //this.cameras.main.startFollow(player);
    //this.cameras.main.followOffset.set(0, 50);

    //animatiopns
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('spritesheet', { start: 28, end: 29 }),
        frameRate: 10,
        repeat: -1,
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'spritesheet', frame: 19 } ],
        frameRate: 10
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('spritesheet', { start: 28, end: 29 }),
        frameRate: 10,
        repeat: -1,
    });

    this.anims.create({
        key: 'jump',
        frames: [ { key: 'spritesheet', frame: 21 } ],
        frameRate: 10
    });

    cursors = this.input.keyboard.createCursorKeys();
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
        player.anims.play('jump');
    }
  }
