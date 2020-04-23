import Phaser from 'phaser';

const Vector2 = Phaser.Math.Vector2;

import Player, { XDirection, Movement } from './Player';
import { Vector } from 'matter';

// Constants for different accelerations and velocities.
const DEFAULT_ACC = 1.33;
const SPRINT_ACC = 2.61;
const WEIGHT_ACC = 8 * DEFAULT_ACC;

const WALK_VELOCITY_CAP = 1.12; // 4 tiles/s
const SPRINT_VELOCITY_CAP = 2 * WALK_VELOCITY_CAP; // 8 tiles/s

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
      { chamfer: { radius: 3 } },
    );

    // Create collision sensors.
    this.sensors = {
      bottom: {
        sensorBody: Bodies.rectangle(
          0.5 * scaledWidth,
          scaledHeight,
          0.5 * scaledWidth,
          0.1,
          {
            isSensor: true,
          },
        ),
        state: false,
      },
      left: {
        sensorBody: Bodies.rectangle(
          0.11 * scaledWidth,
          0.63 * scaledHeight,
          0.1,
          0.55 * scaledHeight,
          {
            isSensor: true,
          },
        ),
        state: false,
      },
      right: {
        sensorBody: Bodies.rectangle(
          0.89 * scaledWidth,
          0.63 * scaledHeight,
          0.1,
          0.55 * scaledHeight,
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
      friction: 0.05,
    });

    // Initialize body props.
    this.setExistingBody(compoundBody);
    this.setFixedRotation();

    // Add some bouncing off surface.
    this.setBounce(0.2);

    this.setPosition(x, y);

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

    /**
     * Only apply friction when the player is touching the ground.
     * (Removes wall friction)
     */

    if (isCollidingBottom) {
      this.setFriction(0.05);
    } else {
      this.setFriction(0);
    }

    /**
     * Remove velocity when colliding horizontally when jumping into walls.
     */
    if (!isCollidingBottom && (isCollidingLeft || isCollidingRight)) {
      this.velocity.x = 0;
    }

    /**
     * Adjust horizontal acceleration based on the sensor and input state.
     */
    if (isCollidingBottom && !isCollidingLeft && left.isDown) {
      // Player moving to left.

      if (shift.isDown) {
        // Player running to left.
        this.updateState(Movement.Sprint);

        if (this.velocity.x > 0) {
          // Remove more aceleration while turning.
          this.acceleration = -SPRINT_ACC - WEIGHT_ACC;
        } else {
          this.acceleration = -SPRINT_ACC;
        }
      } else {
        this.updateState(Movement.Walk);

        if (this.velocity.x > 0) {
          // Remove more acceleration while turning.
          this.acceleration = -DEFAULT_ACC - WEIGHT_ACC;
        } else {
          this.acceleration = -DEFAULT_ACC;
        }
      }
    } else if (isCollidingBottom && !isCollidingRight && right.isDown) {
      // Player moving to right.

      if (shift.isDown) {
        // Player running to right.
        this.updateState(Movement.Sprint);

        if (this.velocity.x < 0) {
          // Add more acceleration while turning.
          this.acceleration = +SPRINT_ACC + WEIGHT_ACC;
        } else {
          this.acceleration = +SPRINT_ACC;
        }
      } else {
        // Player walking to right.
        this.updateState(Movement.Walk);

        if (this.velocity.x < 0) {
          // Add more acceleration while turning.
          this.acceleration = +DEFAULT_ACC + WEIGHT_ACC;
        } else {
          this.acceleration = +DEFAULT_ACC;
        }
      }
    } else if (isCollidingBottom) {
      // No horizontal movement.

      // Add a feel of weight when the character stops moving.
      if (this.velocity.x > 0) {
        // Player turning to left.
        this.acceleration = Math.max(-WEIGHT_ACC, -this.velocity.x / deltaTime);
      } else if (this.velocity.x < 0) {
        // Player turning to right.
        this.acceleration = Math.max(WEIGHT_ACC, this.velocity.x / deltaTime);
      } else {
        // Player is not moving.
        this.updateState(Movement.Idle);
        this.acceleration = 0;
      }
    } else {
      // Player is jumping.
      this.updateState(Movement.Jump);
      this.acceleration = 0;
    }

    /**
     *  Calculate new horizontal velocity.
     *  (vx = v0 + a * dt)
     */
    this.velocity.x = this.velocity.x + this.acceleration * deltaTime;

    /**
     *  Limit horizontal velocity.
     * (removes infinitely incrementing acceleration)
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

    /**
     * Update velocity.
     */
    this.setVelocityX(this.velocity.x);

    /**
     * Check if player tries to and can jump.
     */
    if (up.isDown && isCollidingBottom) {
      this.setVelocityY(-5.5);
      this.updateState(Movement.Jump);
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
