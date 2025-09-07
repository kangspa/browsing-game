# Browsing-Game
Phaser를 사용해서 게임 조작방식으로 블로그를 탐색해보자.
- 결과물 : <https://browsing-game.web.app/>

## 사용 기술

1. **React** : UI 구성
2. **Phaser** : 게임 엔진
3. **Vite** : 프로젝트 빌드
4. **Firebase** : 서버 배포

## 파일 구조

1. `index.html`
    ↳ 진입점 HTML, React 앱을 마운트
2. `main.tsx`
    ↳ React 앱 초기화, `App.tsx` 렌더링
3. `App.tsx`
    ↳ 전체 앱 구조를 정의, `Game.tsx` 포함
4. `Game.tsx`
    ↳ Phaser 게임을 초기화 및 관리
5. `MainScene.ts`
    ↳ Phaser의 주요 게임 씬

- `main.tsx` 까지는 단순 초기화 및 요소 정의만 존재하고, `App.tsx` 부터 본격적인 작성 시작한다.

# App.tsx

외부(`main.tsx`)로 export할 `App`을 정의한다.
HTML 구조를 return함으로써 `main.tsx` → `index.html` 에 전달해준다.
특이사항으로, `handlePipeEnter` 함수를 통해 전달받은 url 이 있을 경우, 해당하는 url로 iframe 페이지를 이동해준다.

# Game.tsx

`Phaser`를 통해 로드할 화면을 처음 초기화해준다.
`scene`에서 전달받는 이벤트 값을 `App.tsx`로 전달하는 역할도 해주고, `Game`을 destroy 하는, 전체적인 생명주기를 관리한다.

# Mainscene.ts

`Phaser`를 통해 요소 로드 및 이벤트 관리를 주로 하게 되는 부분.
`Phaser`에 대한 대부분의 내용들을 작성하게 된 부분이다.

## urlList

특정 파이프 진입 시, 현재 페이지 및 진입 파이프의 넘버를 토대로 index 계산 후 url을 찾기 위한 배열.
iframe에서 직접적으로 갖고오기는 어려워 웹크롤링하듯 블로그의 `category-list`를 크롤링 후 url을 추출해서 저장해둔다.

## iframe과의 상호작용

현재 페이지에서 직접 iframe 내부 요소들에 활성화 명령을 내릴 수가 없어서, iframe의 도메인에 `postMessage`를 전송하는 방식으로 iframe 내부 요소를 컨트롤한다.

스크롤 명령 및 뒤로 가기 명령은 모든 페이지에서 진행되어야하므로, jekyll 블로그 테마에서 `common.js`에 아래와 같이 작성해준다.

```javascript
// iframe으로부터 메세지 수신받는거 해결을 위한 코드
window.addEventListener('message', (e) => {
    if (e.data === "go-back") history.back();
    else if (e.data === "scroll-up") window.scrollBy({ top: -400, behavior: 'smooth' });
    else if (e.data === "scroll-down") window.scrollBy({ top: 400, behavior: 'smooth' });
});
```

pagenation 중 좌우 버튼의 경우, 메인페이지(페이지네이션이 적용된 페이지)에서만 사용하면 되므로, `subject.js`에서 아래와 같이 작성해준다.

```javascript
// iframe으로부터 메세지 수신받는거 해결을 위한 코드
window.addEventListener('message', (e) => {
    if (e.data === "click-prev") {
        if (currentPage !== 1) setCurrentPage(currentPage - 1);
    }
    else if (e.data === "click-next") {
        if (pageCount !== currentPage) setCurrentPage(currentPage + 1);
    }
});
```

이 때, `Mainscene.ts`에서도 `currentPage`에 따라 `urlList`의 index 값을 계산하기도하고, 명령 전송여부도 정해야하여 별도로 `currentPage`를 관리해줘야한다.

<details>
<summary>Firebase 프로젝트 생성 시 기본 Readme 내용</summary>
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
</details>
