// src/Game.tsx
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import MainScene from './Mainscene';

type GameProps = {
  onPipeEnter?: (url: string) => void;
};

const Game: React.FC<GameProps> = ({ onPipeEnter }) => {
  const gameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const scene = new MainScene(onPipeEnter);

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 250,
      physics: {
        default: 'arcade',
        arcade: { gravity: {
          y: 500,
          x: 0
        }, debug: false },
      },
      scene,
      parent: gameRef.current,
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true); // cleanup on component unmount
    };
  }, [onPipeEnter]);

  return <div ref={gameRef} />;
};

export default Game;
