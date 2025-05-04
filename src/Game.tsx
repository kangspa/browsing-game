// src/Game.tsx
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const Game: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current) return;

    class MyScene extends Phaser.Scene {
      constructor() {
        super('MyScene');
      }

      preload() {
        this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
      }

      create() {
        this.add.image(400, 300, 'sky');
      }

      update() {
        // 게임 루프
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-container',
      scene: MyScene,
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div id="phaser-container" />;
};

export default Game;
