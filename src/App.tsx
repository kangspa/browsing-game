import { useEffect, useRef } from 'react';
import './App.css';
import Game from './Game';

const App: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = 'https://kangspa.github.io/';
    }
  }, []);

  return (
    <div>
      <h1>Phaser with React + TypeScript</h1>
      <Game />
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Embedded Website</h2>
        <iframe
          id="browser"
          ref={iframeRef}
          title="External Site"
          width="800"
          height="600"
          style={{ border: '1px solid #ccc' }}
        />
      </div>
    </div>
  );
};

export default App;
