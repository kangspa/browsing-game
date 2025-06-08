import { useEffect, useRef } from 'react';
import './App.css';
import Game from './Game';

const TARGET_URL = 'https://kangspa.github.io/';

const fetchAndParseHTML = async (targetURL:string) => {
  try {
    // 블로그 사이트 크롤링한 후 파싱
    const res = await fetch(targetURL, { mode: 'cors', });
    const htmlText = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    // url 목록 저장할 배열 선언
    const urls: string[] = [];
    // '#category-list > ul > li' 선택자로 글 목록을 가져온다.
    const listItems = doc.querySelectorAll('#category-list > ul > li');
    listItems.forEach((li) => {
      // 각 li 요소에서 a 태그를 찾는다.
      const anchor = li.querySelector(
        '#article_content > div.box_contents > a:nth-child(1)'
      ) as HTMLAnchorElement;
      // load한 href 값 절대경로로 변경 후 추가
      if (anchor?.getAttribute('href')) {
        const relativeHref = anchor.getAttribute('href')!;
        const absoluteHref = new URL(relativeHref, targetURL).href;
        urls.push(absoluteHref);
      }
    });

    return urls;
  } catch (err) {
    console.error('Fetch or parse failed:', err);
  }
};
let URL_LIST: string[] = []; // URL 목록을 저장할 전역 변수
fetchAndParseHTML(TARGET_URL).then((urls) => {
  if (urls) URL_LIST = urls;
});

const App: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 파이프에 진입했을 때 URL_LIST의 index에 일치하는 post로 이동
  const handlePipeEnter = (index: number) => {

    console.log('[App.tsx] onPipeEnter 호출됨. 전달받은 index:', index);
    console.log('Fetched URLs:', URL_LIST);

    if (iframeRef.current) {
      iframeRef.current.src = URL_LIST[index];
    }
  };

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = TARGET_URL;
    }
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
