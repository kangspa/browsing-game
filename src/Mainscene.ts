// src/MainScene.ts
import Phaser from 'phaser';
import fetchAndParseHTML from './fetchUrls';

interface PipeWithIndex extends Phaser.Physics.Arcade.Sprite {
  pipeIndex: number;
}

export default class MainScene extends Phaser.Scene {
  private targetUrl = 'https://kangspa.github.io/'; // 대상 URL

  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private lastDirection: 'left' | 'right' = 'right';

  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private pipeH!: Phaser.Physics.Arcade.Sprite;
  private pipeR!: Phaser.Physics.Arcade.Sprite;
  private pipes!: Phaser.Physics.Arcade.StaticGroup;
  private onPipeEnter?: (url: string) => void;
  private isEnteringPipe = false;

  private urlList!: string[]; // URL 목록을 저장할 프로퍼티
  private pageCount!: number; // 페이지 수를 저장할 프로퍼티
  private currentPage!: number; // 현재 페이지를 저장할 프로퍼티

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
    this.urlList = await fetchAndParseHTML(this.targetUrl);
    this.pageCount = Math.ceil(this.urlList.length / 5) - 1;
    this.currentPage = 0; // 현재 페이지 초기화
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
    this.player = this.physics.add.sprite(130, 150, 'mario');
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
    this.cursors = (this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin).createCursorKeys();

    // prev 블럭 생성
    const prevBlock = this.physics.add.staticSprite(192, 150, 'blocks', 4);
    this.physics.add.collider(this.player, prevBlock, (obj1, obj2) => {
      const player = obj1 as Phaser.Physics.Arcade.Sprite;
      const block = obj2 as Phaser.Physics.Arcade.Sprite;

      const body = player.body as Phaser.Physics.Arcade.Body;
      if (body.touching.up && !this.isEnteringPipe) {
        // 블록 튕기기 애니메이션
        this.tweens.add({
          targets: block,
          y: block.y - 8,
          duration: 100,
          yoyo: true,
          ease: 'Power1',
        });

        const iframe = document.querySelector('iframe') as HTMLIFrameElement;
        iframe?.contentWindow?.postMessage('click-prev', 'https://kangspa.github.io');
        if (this.currentPage !== 0) this.currentPage--;
      };
    });

    // next 블럭 생성
    const nextBlock = this.physics.add.staticSprite(288, 150, 'blocks', 5);
    this.physics.add.collider(this.player, nextBlock, (obj1, obj2) => {
      const player = obj1 as Phaser.Physics.Arcade.Sprite;
      const block = obj2 as Phaser.Physics.Arcade.Sprite;

      const body = player.body as Phaser.Physics.Arcade.Body;
      if (body.touching.up && !this.isEnteringPipe) {
        // 블록 튕기기 애니메이션
        this.tweens.add({
          targets: block,
          y: block.y - 8,
          duration: 100,
          yoyo: true,
          ease: 'Power1',
        });

        const iframe = document.querySelector('iframe') as HTMLIFrameElement;
        iframe?.contentWindow?.postMessage('click-next', 'https://kangspa.github.io');
        if (this.pageCount !== this.currentPage) this.currentPage++;
      };
    });

    // 스크롤 업 다운 블럭 생성
    const upBlock = this.physics.add.staticSprite(240, 90, 'blocks', 2);
    this.physics.add.collider(this.player, upBlock, (obj1, obj2) => {
      const player = obj1 as Phaser.Physics.Arcade.Sprite;
      const block = obj2 as Phaser.Physics.Arcade.Sprite;

      const body = player.body as Phaser.Physics.Arcade.Body;
      if (body.touching.up) {
        // 블록 튕기기 애니메이션
        this.tweens.add({
          targets: block,
          y: block.y - 8,
          duration: 100,
          yoyo: true,
          ease: 'Power1',
        });

        const iframe = document.querySelector('iframe') as HTMLIFrameElement;
        iframe?.contentWindow?.postMessage('scroll-up', 'https://kangspa.github.io');
      };
    });

    const downBlock = this.physics.add.staticSprite(240, 150, 'blocks', 3);
    this.physics.add.collider(this.player, downBlock, (obj1, obj2) => {
      const player = obj1 as Phaser.Physics.Arcade.Sprite;
      const block = obj2 as Phaser.Physics.Arcade.Sprite;

      const body = player.body as Phaser.Physics.Arcade.Body;
      if (body.touching.up) {
        // 블록 튕기기 애니메이션
        this.tweens.add({
          targets: block,
          y: block.y - 8,
          duration: 100,
          yoyo: true,
          ease: 'Power1',
        });

        const iframe = document.querySelector('iframe') as HTMLIFrameElement;
        iframe?.contentWindow?.postMessage('scroll-down', 'https://kangspa.github.io');
      };
    });

    // 파이프 추가
    this.pipeH = this.physics.add.staticSprite(66, 202, 'pipes', 5);
    this.physics.add.collider(this.pipeH, this.platforms);
    this.physics.add.collider(this.pipeH, this.player);

    this.pipeR = this.physics.add.staticSprite(130, 202, 'pipes', 6);
    this.physics.add.collider(this.pipeR, this.platforms);
    this.physics.add.collider(this.pipeR, this.player);

    // 파이프 생성
    this.pipes = this.physics.add.staticGroup();

    const pipePositions = [350, 446, 542, 638, 734];
    pipePositions.forEach((x, i) => {
      const pipe = this.pipes.create(x, 202, 'pipes', i) as PipeWithIndex;
      pipe.setImmovable(true);
      pipe.pipeIndex = i; // 사용자 정의 프로퍼티로 index 저장
    });

    this.physics.add.collider(this.pipes, this.platforms);
    this.physics.add.collider(this.pipes, this.player);
  }

  private playPipeTransitionAnimation() {
    this.tweens.add({
      targets: this.player,
      y: this.player.y + 20, // 아래로 이동
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        // 파이프 입구 위치로 이동
        this.player.setPosition(130, 202);

        // 위로 올라오는 애니메이션
        this.tweens.add({
          targets: this.player,
          y: 180,
          alpha: 1,
          duration: 400,
          ease: 'Power2',
        });
      },
    });
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

    if (this.cursors.down?.isDown && body.blocked.down) {
      const playerBounds = this.player.getBounds();

      for (const pipe of this.pipes.getChildren()) {
        const p = pipe as PipeWithIndex;
        const pipeBounds = p.getBounds();

        const isOnPipe =
          playerBounds.bottom === pipeBounds.top &&
          playerBounds.right > pipeBounds.left &&
          playerBounds.left < pipeBounds.right;

        if (isOnPipe && !this.isEnteringPipe) {
          this.isEnteringPipe = true;
          const index = p.pipeIndex;
          const url = this.urlList[index + this.currentPage * 5];
          this.onPipeEnter?.(url);
          this.playPipeTransitionAnimation();
          break; // 다른 파이프 검사하지 않음
        }
      }
      // pipeH에 진입 이벤트 발생하는지 확인
      const pipeHBounds = this.pipeH.getBounds();
      const isOnPipeH =
        playerBounds.bottom === pipeHBounds.top &&
        playerBounds.right > pipeHBounds.left &&
        playerBounds.left < pipeHBounds.right;
      if (isOnPipeH && this.isEnteringPipe) {
        this.isEnteringPipe = false;
        const iframe = document.querySelector('iframe') as HTMLIFrameElement;
        iframe?.contentWindow?.postMessage('go-back', 'https://kangspa.github.io');
        this.playPipeTransitionAnimation();
      }
      // pipeR에 진입 이벤트 발생하는지 확인
      const pipeRBounds = this.pipeR.getBounds();
      const isOnPipeR =
        playerBounds.bottom === pipeRBounds.top &&
        playerBounds.right > pipeRBounds.left &&
        playerBounds.left < pipeRBounds.right;
      if (isOnPipeR) window.location.reload();
    };
  }
}
