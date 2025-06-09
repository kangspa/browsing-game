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

  const blockFrames = [
    { x: 32, y: 0, desc: '스크롤을 위로 400 이동' },
    { x: 48, y: 0, desc: '스크롤을 아래로 400 이동' },
    { x: 64, y: 0, desc: '메인페이지일 경우, 왼쪽으로 페이지 넘김' },
    { x: 80, y: 0, desc: '메인페이지일 경우, 오른쪽으로 페이지 넘김' }
  ];

  const pipeFrames = [
    { x: 0, y: 0, desc: '현재 화면의 post 중 첫번째 post로 이동' },
    { x: 32, y: 0, desc: '현재 화면의 post 중 두번째 post로 이동' },
    { x: 64, y: 0, desc: '현재 화면의 post 중 세번째 post로 이동' },
    { x: 96, y: 0, desc: '현재 화면의 post 중 네번째 post로 이동' },
    { x: 128, y: 0, desc: '현재 화면의 post 중 다섯번째 post로 이동' },
    { x: 160, y: 0, desc: '특정 post로 이동한 상황일 경우, 뒤로가기' },
    { x: 192, y: 0, desc: '현재 페이지 새로고침' }
  ];

  const allFrames = [
    ...blockFrames.map(f => ({ ...f, type: 'block' })),
    ...pipeFrames.map(f => ({ ...f, type: 'pipe' })),
  ];

  return (
    <div id="app">
      <div id="main">
        <div className="iframe-wrapper" style={{ marginTop: '2rem', position: 'relative', width: '800px', height: '500px' }}>
          <iframe
            id="browser"
            ref={iframeRef}
            title="External Site"
            width="800"
            height="500"
            style={{ border: '1px solid #ccc' }}
          />
          <div className="iframe-overlay" />
        </div>
        <Game onPipeEnter={handlePipeEnter} />
      </div>
      <div id="descript" style={{ textAlign: 'left' }}>
        <h3>조작 방법</h3>
        <p>
          Phaser를 사용하여 웹 페이지를 탐색하는 게임입니다.
          <br />
          파이프를 통해 다른 페이지로 이동할 수 있습니다.
          <br />
          키보드의 방향키를 사용하여 조작해주세요.
          <br />
          블럭은 아래쪽을 머리로 부딪쳐주세요.
          <br />
          파이프는 아래 화살표를 누르면 진입합니다.
        </p>
        <hr />
        <div className="frame-table">
          {allFrames.map((frame, i) => (
            <div className="frame-row" key={i}>
              <div
                className={frame.type === 'block' ? 'blockFrame' : 'pipeFrame'}
                style={{ backgroundPosition: `-${frame.x}px -${frame.y}px` }}
              />
              <div className="desc">{frame.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
