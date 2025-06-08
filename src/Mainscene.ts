// src/MainScene.ts
import Phaser from 'phaser';
import fetchAndParseHTML from './fetchUrls';

export default class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private lastDirection: 'left' | 'right' = 'right';

  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private pipes!: Phaser.Physics.Arcade.StaticGroup;
  private onPipeEnter?: (url: string) => void;

  private urlList!: string[]; // URL 목록을 저장할 프로퍼티

  constructor(onPipeEnter?: (url: string) => void) {
    super('MainScene');
    this.onPipeEnter = onPipeEnter;
  }

  preload() {
    this.load.image('sky', '/sky.png');
    this.load.image('grass', '/grass.png');
    this.load.image('cloud', '/cloud.png');
    this.load.spritesheet('blocks', '/usedBlock.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('pipes', '/usedPipe.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('mario', '/merged_output.png', { frameWidth: 17, frameHeight: 16 });
  }
  
  private async loadUrls() {
    const targetUrl = 'https://kangspa.github.io/'; // 대상 URL
    this.urlList = await fetchAndParseHTML(targetUrl);
    console.log('Fetched URLs in scene:', this.urlList);
  }

  create() {
    this.loadUrls();
    // 배경 이미지와 구름, 풀을 추가
    this.add.image(400, 125, 'sky');
    let randomValue;
    randomValue = Math.floor(Math.random() * (200 - 75 + 1)) + 75;
    for (let i = (randomValue-75); i < 800; i += randomValue) {
      this.add.image(i, 30, 'cloud');
    }
    randomValue = Math.floor(Math.random() * (200 - 75 + 1)) + 75;
    for (let i = (randomValue-75); i < 800; i += randomValue) {
      this.add.image(i, 210, 'grass');
    }
    // 플레이어가 디딜 땅을 추가
    this.platforms = this.physics.add.staticGroup();
    for (let j = 226; j < 250; j += 16) {
      for (let i = 8; i < 800; i += 16) {
        this.platforms.create(i, j, 'blocks', 0);
      }
    }

    // 플레이어 추가
    this.player = this.physics.add.sprite(100, 170, 'mario');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setFrame(6);
    this.player.anims.stop();
    // 애니메이션 설정
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('mario', { start: 2, end: 4 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('mario', { start: 7, end: 9 }),
      frameRate: 10,
      repeat: -1
    });

    this.physics.add.collider(this.player, this.platforms);

    // prev 블럭 생성
    const prevBlock = this.physics.add.staticSprite(160, 150, 'blocks', 4);
    this.physics.add.collider(this.player, prevBlock, () => {
      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
      iframe?.contentWindow?.postMessage('click-prev', 'https://kangspa.github.io');
    });

    // next 블럭 생성
    const nextBlock = this.physics.add.staticSprite(256, 150, 'blocks', 5);
    this.physics.add.collider(this.player, nextBlock, () => {
      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
      iframe?.contentWindow?.postMessage('click-next', 'https://kangspa.github.io');
    });

    // 파이프 추가
    const pipeH = this.physics.add.sprite(66, 202, 'pipes', 5);
    this.physics.add.collider(pipeH, this.platforms);

    // 파이프 생성
    interface PipeWithIndex extends Phaser.Physics.Arcade.Sprite {
      pipeIndex: number;
    }
    this.pipes = this.physics.add.staticGroup();

    const pipePositions = [350, 446, 542, 638, 734];
    pipePositions.forEach((x, i) => {
      const pipe = this.pipes.create(x, 202, 'pipes', i) as PipeWithIndex;
      pipe.setImmovable(true);
      pipe.pipeIndex = i; // 사용자 정의 프로퍼티로 index 저장
    });

    this.physics.add.collider(this.pipes, this.platforms);

    // 파이프 충돌 시 이벤트 발사
    this.physics.add.overlap(this.player, this.pipes, (_player, pipe) => {
      const pipeWithIndex = pipe as PipeWithIndex;
      const index = pipeWithIndex.pipeIndex;
      this.onPipeEnter?.(this.urlList[index]);
    });

    this.cursors = (this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin).createCursorKeys();
  }

  update() {
    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('left', true);
      this.lastDirection = 'left';
    } else if (this.cursors.right?.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('right', true);
      this.lastDirection = 'right';
    } else {
      this.player.setVelocityX(0);
      this.player.anims.stop();
      if (this.lastDirection === 'left') {
        this.player.setFrame(5);
      } else {
        this.player.setFrame(6);
      }
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (this.cursors.up?.isDown && body.onFloor()) {
        this.player.setVelocityY(-300);
    }
  }
}
