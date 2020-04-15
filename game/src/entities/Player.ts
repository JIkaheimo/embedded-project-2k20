import Phaser from 'phaser';

/**
 * Examples
 * https://itnext.io/modular-game-worlds-in-phaser-3-tilemaps-5-matter-physics-platformer-d14d1f614557
 */

// Constants for different acceleration and velocity.
const DEFAULT_ACC = 5;
const SPRINT_ACC = 2 * DEFAULT_ACC;
const WEIGHT_ACC = 4 * DEFAULT_ACC;

const WALK_VELOCITY_CAP = 2.5;
const SPRINT_VELOCITY_CAP = 1.5 * WALK_VELOCITY_CAP;

enum Movement {
  Idle,
  Walk,
  Sprint,
}

enum XDirection {
  None = 0,
  Left = -1,
  Right = 1,
}

interface Sensor {
  sensor;
  state;
}

interface PlayerSensors {
  left: Sensor;
  right: Sensor;
  bottom: Sensor;
}

export default class Player {
  private sensors: PlayerSensors;
  private sprite: Phaser.Physics.Matter.Sprite;
  private acceleration: number = DEFAULT_ACC;
  private velocity: number = 0;
  private canJump: boolean = true;
  private jumpTimer = null;

  constructor(private scene: Phaser.Scene, x, y) {
    // Create player animations.
    scene.anims.create({
      key: 'idle',
      frames: [{ key: 'player', frame: 'idle' }],
    });

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
    const mainBody = Bodies.rectangle(0.5 * w, 0.6 * h, 0.65 * w, 0.8 * h, {});

    // Create collision sensors.
    this.sensors = {
      bottom: {
        sensor: Bodies.rectangle(0.5 * w, h + 2, 0.64 * w, 2, {
          isSensor: true,
        }),
        state: false,
      },
      left: {
        sensor: Bodies.rectangle(0.15 * w - 2, (3 * h) / 5, 2, h * 0.5, {
          isSensor: true,
        }),
        state: false,
      },
      right: {
        sensor: Bodies.rectangle(0.85 * w + 2, (3 * h) / 5, 2, h * 0.5, {
          isSensor: true,
        }),
        state: false,
      },
    };

    // Combine body and sensors.
    const compoundBody = Body.create({
      parts: [
        mainBody,
        this.sensors.bottom.sensor,
        this.sensors.left.sensor,
        this.sensors.right.sensor,
      ],
      frictionStatic: 0,
      frictionAir: 0.02,
      friction: 0.1,
    });

    // Initialize body props.
    this.sprite
      .setExistingBody(compoundBody)
      .setScale(0.12)
      .setFixedRotation()
      .setPosition(x, y);

    const collisionConfig = {
      objectA: [
        this.sensors.bottom.sensor,
        this.sensors.left.sensor,
        this.sensors.right.sensor,
      ],
      callback: this.onSensorCollide,
      context: this,
    };

    // Add collision detection to sensors.
    scene.matterCollision.addOnCollideStart(collisionConfig);
    scene.matterCollision.addOnCollideActive(collisionConfig);

    // Reset sensor state before each update.
    this.scene.matter.world.on('beforeupdate', this.resetSensors, this);

    // Update when scene updates.
    this.scene.events.on('update', this.update, this);
  }

  update(time, deltaTime) {
    // "Shortened" way to get required state from object...
    const {
      sprite,
      scene: {
        controls: { left, right, shift, up },
      },
      sensors: {
        bottom: { state: isOnGround },
      },
    } = this;

    let moveState = Movement.Idle;
    let xDirection = XDirection.None;

    // Convert millis to seconds.
    deltaTime = deltaTime / 1000;

    /** HORIZONTAL MOVEMENT **/

    if (isOnGround) {
      if (left.isDown) {
        xDirection = XDirection.Left;

        if (shift.isDown) {
          // Sprint
          moveState = Movement.Sprint;
          this.acceleration = -SPRINT_ACC;
        } else {
          // Walk
          moveState = Movement.Walk;
          this.acceleration = -DEFAULT_ACC;
        }

        // Add more boost when turning.
        if (this.velocity > 0) {
          this.acceleration -= WEIGHT_ACC;
        }

        // Movement left end.
      } else if (right.isDown) {
        xDirection = XDirection.Right;

        if (shift.isDown) {
          // Sprint
          moveState = Movement.Sprint;
          this.acceleration = SPRINT_ACC;
        } else {
          // Walk
          moveState = Movement.Walk;
          this.acceleration = DEFAULT_ACC;
        }

        // Add more boost when turning.
        if (this.velocity < 0) {
          this.acceleration += WEIGHT_ACC;
        }

        // Movement right end.
      } else {
        // No horizontal movement.

        // Add a feel of weight when the character stops moving.
        if (this.velocity > 0) {
          this.acceleration = Math.max(-WEIGHT_ACC, -this.velocity / deltaTime);
        } else if (this.velocity < 0) {
          this.acceleration = Math.max(WEIGHT_ACC, this.velocity / deltaTime);
        } else {
          this.acceleration = 0;
        }

        // No horizontal movement end.
      }

      // Limit horizontal speed for gameplay reasons...
      if (moveState === Movement.Sprint) {
        if (Math.abs(this.velocity) > SPRINT_VELOCITY_CAP) {
          this.acceleration = 0;
          this.velocity = SPRINT_VELOCITY_CAP * xDirection;
        }
      } else if (moveState === Movement.Walk) {
        if (Math.abs(this.velocity) > WALK_VELOCITY_CAP) {
          this.acceleration = 0;
          this.velocity = WALK_VELOCITY_CAP * xDirection;
        }
      }

      // Calculate new velocity.
      this.velocity += this.acceleration * deltaTime;

      // Update player entity.
      if (moveState === Movement.Sprint) {
        sprite.play('run', true);
      } else if (moveState === Movement.Walk) {
        sprite.play('walk', true);
      }

      if (this.velocity === 0) {
        sprite.play('idle');
      } else if (this.velocity > 0) {
        sprite.setFlipX(false);
      } else {
        sprite.setFlipX(true);
      }

      sprite.setVelocityX(this.velocity);

      if (up.isDown) {
        // Jump
        sprite.setVelocityY(-6.5);
        sprite.play('jump', false);
      }
    }

    /** VERTICAL MOVEMENT **/

    // Normalize and scale the velocity so player can't move faster along diagonal.
    //sprite.body.velocity.normalize().scale(speed);
  }

  resetSensors() {
    // Resets collision sensor states.
    // Gets called before each phaser scene update.

    const {
      sensors: { bottom, left, right },
    } = this;

    bottom.state = false;
    left.state = false;
    right.state = false;
    // Add more sensors here:
  }

  onSensorCollide({ bodyA: sensor, bodyB: collide, pair }) {
    // Handles sensor collision events.
    const {
      sensors: { bottom, left, right },
    } = this;

    if (collide.isSensor) return;

    if (sensor === left.sensor) {
      left.state = true;
      if (pair.separation > 0.5) this.sprite.x += pair.separation - 0.5;
    } else if (sensor === right.sensor) {
      right.state = true;
      if (pair.separation > 0.5) this.sprite.x -= pair.separation - 0.5;
    } else if (sensor === bottom.sensor) {
      bottom.state = true;
    }
  }
}
