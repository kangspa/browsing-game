// src/fetchUrls.ts
export default async function fetchAndParseHTML(targetURL: string): Promise<string[]> {
  try {
    const res = await fetch(targetURL, { mode: 'cors' });
    const htmlText = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    const urls: string[] = [];

    const listItems = doc.querySelectorAll('#category-list > ul > li');
    listItems.forEach((li) => {
      const anchor = li.querySelector(
        '#article_content > div.box_contents > a:nth-child(1)'
      ) as HTMLAnchorElement;

      if (anchor?.getAttribute('href')) {
        const relativeHref = anchor.getAttribute('href')!;
        const absoluteHref = new URL(relativeHref, targetURL).href;
        urls.push(absoluteHref);
      }
    });

    return urls;
  } catch (err) {
    console.error('Fetch or parse failed:', err);
    return [];
  }
};
