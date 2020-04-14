import Phaser from 'phaser';

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;

    // Create player animations.
    scene.anims.create({
      key: 'walk',
      frames: scene.anims.generateFrameNames('player', {
        prefix: 'walk',
        start: 0,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: 'run',
      frames: scene.anims.generateFrameNames('player', {
        prefix: 'run',
        start: 0,
        end: 2,
      }),
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: 'jump',
      frames: [{ key: 'player', frame: 'jump' }],
      frameRate: 10,
    });

    scene.anims.create({
      key: 'fall',
      frames: [{ key: 'player', frame: 'fall' }],
      frameRate: 10,
    });

    // Create physics-based sprite that we will be moved around and animated.
    this.sprite = scene.matter.add.sprite(0, 0, 'player', 0);

    // Get underlying Matter lib.
    const { Body, Bodies } = Phaser.Physics.Matter.Matter;
    const { width: w, height: h } = this.sprite;

    // Create main body.
    const mainBody = Bodies.rectangle(w / 2, (3 * h) / 5, 0.7 * w, 0.8 * h, {
      chamfer: { radius: 40 },
    });

    // Create collision sensors.
    this.sensors = {
      bottom: Bodies.rectangle(0.5 * w, h + 2, 0.4 * w, 2, {
        isSensor: true,
      }),
      left: Bodies.rectangle(0.15 * w - 2, (3 * h) / 5, 2, h * 0.5, {
        isSensor: true,
      }),
      right: Bodies.rectangle(0.85 * w + 2, (3 * h) / 5, 2, h * 0.5, {
        isSensor: true,
      }),
    };

    // Combine body and sensors.
    const compoundBody = Body.create({
      parts: [
        mainBody,
        this.sensors.bottom,
        this.sensors.left,
        this.sensors.right,
      ],
      frictionStatic: 0,
      frictionAir: 0.02,
      friction: 0.1,
    });

    // Initialize body props.
    this.sprite
      .setExistingBody(compoundBody)
      .setScale(0.15)
      .setFixedRotation()
      .setPosition(x, y);

    // Update when scene updates.
    this.scene.events.on('update', this.update, this);
  }

  update() {
    const { sprite } = this;
    const { controls } = this.scene;

    const moveForce = 0.003;

    // Horizontal movement.
    if (controls.left.isDown) {
      // Movement left.
      if (controls.shift.isDown) {
        // Run
        sprite.applyForce({ x: -moveForce, y: 0 });
        sprite.play('run', true);
      } else {
        // Walk
        sprite.applyForce({ x: -moveForce, y: 0 });
        sprite.play('walk', true);
      }
      sprite.setFlipX(true);
    } else if (controls.right.isDown) {
      // Movement right.
      if (controls.shift.isDown) {
        // Run
        sprite.setVelocityX(10);
        sprite.play('run', true);
      } else {
        // Walk
        sprite.setVelocityX(5);
        sprite.play('walk', true);
      }

      sprite.setFlipX(false);
    }

    // Vertical movement.
    if (controls.up.isDown) {
      // Jump
      sprite.setVelocityY(-10);
      sprite.play('jump', false);
    }

    // Normalize and scale the velocity so player can't move faster along diagonal.
    //sprite.body.velocity.normalize().scale(speed);
  }
}
