import Phaser from 'phaser';

/**
 * Examples
 * https://itnext.io/modular-game-worlds-in-phaser-3-tilemaps-5-matter-physics-platformer-d14d1f614557
 */

export enum Movement {
  None = -1,
  Idle = 0,
  Walk = 1,
  Sprint = 2,
  Jump = 3,
}

export enum XDirection {
  None = 0,
  Left = -1,
  Right = 1,
}

export default class Player extends Phaser.Physics.Matter.Sprite {
  protected mainBody: Body;
  public movementState = Movement.Idle;
  protected prevMovementState = Movement.None;
  protected xDirection = XDirection.None;

  readonly velocity = {
    x: 0,
    y: 0,
  };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, 'player', 0);

    // Add sprite to the scene.
    scene.add.existing(this);

    // Create player animations.
    scene.anims.create({
      key: 'idle',
      frames: [
        {
          key: 'player',
          frame: 'idle',
        },
      ],
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
      frames: [
        {
          key: 'player',
          frame: 'jump',
        },
      ],
      frameRate: 10,
    });

    scene.anims.create({
      key: 'fall',
      frames: [
        {
          key: 'player',
          frame: 'fall',
        },
      ],
      frameRate: 10,
    });

    // Update when scene updates.
    this.scene.events.on('update', this.update, this);

    // Scale the texture.
    this.setScale(0.1);

    const { width, height } = this;

    const scaledWidth = width * this.scaleX;
    const scaledHeight = height * this.scaleY;

    // Create main body.
    const mainBody = Phaser.Physics.Matter.Matter.Bodies.rectangle(
      0.5 * scaledWidth,
      0.63 * scaledHeight,
      0.7 * scaledWidth,
      0.7 * scaledHeight,
      {},
    );

    this.setExistingBody(mainBody);

    // Disable rotation.
    this.setFixedRotation();
  }

  update() {
    // Update animation based on the state if it has changed.
    if (this.prevMovementState != this.movementState) {
      switch (this.movementState) {
        case Movement.Idle:
          this.play('idle');
          break;
        case Movement.Walk:
          this.play('walk');
          break;
        case Movement.Sprint:
          this.play('run');
          break;
        case Movement.Jump:
          this.play('jump');
          break;
      }
    }

    // Flip the character texture based on the velocity.
    if (this.velocity.x > 0) {
      this.setFlipX(false);
    } else if (this.velocity.x < 0) {
      this.setFlipX(true);
    }
  }

  public updateState(movementState) {
    this.prevMovementState = this.movementState;
    this.movementState = movementState;
  }

  public updateVelocity({ x, y }) {
    if (x) {
      this.velocity.x = x;
      this.setVelocityX(x);
    }
    if (y) {
      this.velocity.y = y;
      this.setVelocityY(y);
    }
  }

  /** VERTICAL MOVEMENT **/

  // Normalize and scale the velocity so player can't move faster along diagonal.
  //sprite.body.velocity.normalize().scale(speed);
}
