import Phaser from 'phaser';

const Vector2 = Phaser.Math.Vector2;

import Player, { XDirection, Movement } from './Player';
import { Vector } from 'matter';

// Constants for different accelerations and velocities.
const DEFAULT_ACC = 5;
const SPRINT_ACC = 2 * DEFAULT_ACC;
const WEIGHT_ACC = 4 * DEFAULT_ACC;

const WALK_VELOCITY_CAP = 2;
const SPRINT_VELOCITY_CAP = 1.5 * WALK_VELOCITY_CAP;

interface Sensor {
  sensorBody;
  state;
}

interface PlayerSensors {
  left: Sensor;
  right: Sensor;
  bottom: Sensor;
}

export default class ControlledPlayer extends Player {
  private sensors: PlayerSensors;
  private acceleration: number = 0;

  private jumpTimer = null;

  constructor(scene, x, y) {
    super(scene, x, y);

    // Get underlying Matter lib.

    const { Body, Bodies } = Phaser.Physics.Matter.Matter;
    const { width, height } = this;

    const scaledWidth = width * this.scaleX;
    const scaledHeight = height * this.scaleY;

    // Create main body.
    const mainBody = Bodies.rectangle(
      0.5 * scaledWidth,
      0.63 * scaledHeight,
      0.7 * scaledWidth,
      0.7 * scaledHeight,
      {},
    );

    // Create collision sensors.
    this.sensors = {
      bottom: {
        sensorBody: Bodies.rectangle(
          0.5 * scaledWidth,
          scaledHeight + 1,
          0.65 * scaledWidth,
          1,
          {
            isSensor: true,
          },
        ),
        state: false,
      },
      left: {
        sensorBody: Bodies.rectangle(
          0.15 * scaledWidth - 1,
          0.63 * scaledHeight,
          1,
          0.6 * scaledHeight,
          {
            isSensor: true,
          },
        ),
        state: false,
      },
      right: {
        sensorBody: Bodies.rectangle(
          0.85 * scaledWidth + 1,
          0.63 * scaledHeight,
          1,
          0.6 * scaledHeight,
          {
            isSensor: true,
          },
        ),
        state: false,
      },
    };

    // Combine body and sensors.
    const compoundBody = Body.create({
      parts: [
        mainBody,
        this.sensors.bottom.sensorBody,
        this.sensors.left.sensorBody,
        this.sensors.right.sensorBody,
      ],
      frictionStatic: 0,
      frictionAir: 0.02,
      friction: 0.1,
    });

    // Initialize body props.
    this.setExistingBody(compoundBody);
    this.setFixedRotation();

    // Disable bounce.
    this.setBounce(0);

    const collisionConfig = (callback) => ({
      objectA: [
        this.sensors.bottom.sensorBody,
        this.sensors.left.sensorBody,
        this.sensors.right.sensorBody,
      ],
      callback,
      context: this,
    });

    // Add collision detection to sensors.
    scene.matterCollision.addOnCollideStart(
      collisionConfig(this.onSensorCollide),
    );
    scene.matterCollision.addOnCollideActive(
      collisionConfig(this.onSensorCollide),
    );
    scene.matter.world.on('beforeupdate', this.resetSensors, this);
  }

  update(time, deltaTime) {
    // Get required state.
    const {
      scene: {
        controls: { left, right, shift, up },
      },
      sensors: {
        left: { state: isCollidingLeft },
        bottom: { state: isCollidingBottom },
        right: { state: isCollidingRight },
      },
    } = this;

    this.xDirection = XDirection.None;

    // Convert millis to seconds.
    deltaTime = deltaTime / 1000;

    // Only apply friction when the player is touching the ground.
    // (Removes "sticky" walls)
    if (isCollidingBottom) {
      this.setFriction(0.1);
    } else {
      this.setFriction(0);
    }

    if (isCollidingBottom && !isCollidingLeft && left.isDown) {
      if (shift.isDown) {
        this.updateState(Movement.Sprint);

        if (this.velocity.x > 0) {
          this.acceleration = -SPRINT_ACC - WEIGHT_ACC;
        } else {
          this.acceleration = -SPRINT_ACC;
        }
      } else {
        this.updateState(Movement.Walk);

        if (this.velocity.x > 0) {
          this.acceleration = -DEFAULT_ACC - WEIGHT_ACC;
        } else {
          this.acceleration = -DEFAULT_ACC;
        }
      }
    } else if (isCollidingBottom && !isCollidingRight && right.isDown) {
      if (shift.isDown) {
        this.updateState(Movement.Sprint);

        if (this.velocity.x < 0) {
          this.acceleration = +SPRINT_ACC + WEIGHT_ACC;
        } else {
          this.acceleration = +SPRINT_ACC;
        }
      } else {
        this.updateState(Movement.Walk);

        if (this.velocity.x < 0) {
          this.acceleration = +DEFAULT_ACC + WEIGHT_ACC;
        } else {
          this.acceleration = +DEFAULT_ACC;
        }
      }
    } else if (isCollidingBottom) {
      // No horizontal movement.

      // Add a feel of weight when the character stops moving.
      if (this.velocity.x > 0) {
        this.acceleration = Math.max(-WEIGHT_ACC, -this.velocity.x / deltaTime);
      } else if (this.velocity.x < 0) {
        this.acceleration = Math.max(WEIGHT_ACC, this.velocity.x / deltaTime);
      } else {
        this.updateState(Movement.Idle);
        this.acceleration = 0;
      }
    } else {
      this.updateState(Movement.Jump);
      this.acceleration = 0;
    }

    /**
     *  Calculate new horizontal velocity.
     *
     *  vx = v0 + a * dt
     */
    this.velocity.x = this.velocity.x + this.acceleration * deltaTime;

    /**
     *  Limit horizontal velocity.
     */

    if (
      this.movementState === Movement.Sprint &&
      this.velocity.x > SPRINT_VELOCITY_CAP
    ) {
      this.velocity.x = SPRINT_VELOCITY_CAP;
    }

    if (
      this.movementState === Movement.Sprint &&
      this.velocity.x < -SPRINT_VELOCITY_CAP
    ) {
      this.velocity.x = -SPRINT_VELOCITY_CAP;
    }

    if (
      this.movementState === Movement.Walk &&
      this.velocity.x > WALK_VELOCITY_CAP
    ) {
      this.velocity.x = WALK_VELOCITY_CAP;
    }

    if (
      this.movementState === Movement.Walk &&
      this.velocity.x < -WALK_VELOCITY_CAP
    ) {
      this.velocity.x = -WALK_VELOCITY_CAP;
    }

    this.setVelocityX(this.velocity.x);

    if (up.isDown && isCollidingBottom) {
      // Jump
      this.setVelocityY(-7);
      this.updateState(Movement.Jump);
      this.isJumping = true;

      this.jumpTimer = this.scene.time.addEvent({
        delay: 500,
        callback: () => (this.isJumping = false),
      });
    }

    super.update();
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

    if (sensor === left.sensorBody) {
      left.state = true;
    } else if (sensor === right.sensorBody) {
      right.state = true;
    } else if (sensor === bottom.sensorBody) {
      bottom.state = true;
    }
  }
}
