import { useEffect, useRef } from 'react';
import './App.css';
import Game from './Game';

const TARGET_URL = 'https://kangspa.github.io/';

const App: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 파이프에 진입했을 때 URL_LIST의 url에 일치하는 post로 이동
  const handlePipeEnter = (url: string) => {
    console.log('[App.tsx] onPipeEnter 호출됨. 전달받은 url:', url);
    if (iframeRef.current) iframeRef.current.src = url;
  };

  useEffect(() => {
    if (iframeRef.current) iframeRef.current.src = TARGET_URL;
  }, []);

  return (
    <div>
      <h1>Phaser with React + TypeScript</h1>
      <Game onPipeEnter={handlePipeEnter} />
      
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
