// src/scenes/MainScene.ts
import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.image('background', 'sky.png');
    this.load.spritesheet('ground', 'blocks.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('mario', 'merged_output.png', { frameWidth: 17, frameHeight: 16 });
  }

  create() {
    this.add.image(400, 200, 'background');

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(100, 200, 'ground', 213);

    this.player = this.physics.add.sprite(100, 300, 'mario');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('mario', { start: 1, end: 4 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('mario', { start: 7, end: 10 }),
      frameRate: 10,
      repeat: -1
    });

    this.physics.add.collider(this.player, this.platforms);
    this.cursors = (this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin).createCursorKeys();
  }

  update() {
    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('left', true);
    } else if (this.cursors.right?.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.stop();
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (this.cursors.up?.isDown && body.onFloor()) {
        this.player.setVelocityY(-300);
    }
  }
}
