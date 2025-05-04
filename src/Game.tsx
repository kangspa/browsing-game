// src/Game.tsx
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import MainScene from './Mainscene';

const Game: React.FC = () => {
  const gameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 400,
      physics: {
        default: 'arcade',
        arcade: { gravity: {
          y: 500,
          x: 0
        }, debug: false },
      },
      scene: MainScene,
      parent: gameRef.current,
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true); // cleanup on component unmount
    };
  }, []);

  return <div ref={gameRef} />;
};

export default Game;
