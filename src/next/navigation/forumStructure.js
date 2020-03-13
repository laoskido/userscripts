import { request } from 'common/request';
import { observeDOM } from 'common/util';
import * as store from 'common/store';
import log from 'log';

const STRUCTURE_KEY = 'forum_structure';
const DEFAULT_STRUCTURE = [
  {
    title: 'Đại sảnh',
    url: '/#dai-sanh.1',
    boxes: [
      { title: 'Thông báo', url: '/f/thong-bao.2/' },
      { title: 'Góp ý', url: '/f/gop-y.3/' },
    ],
  },
  {
    title: 'Khu vui chơi giải trí',
    url: '/#khu-vui-choi-giai-tri.16',
    boxes: [
      { title: 'Chuyện trò linh tinh™', url: '/f/chuyen-tro-linh-tinh.17/' },
      { title: 'Điểm báo', url: '/f/diem-bao.33/' },
    ],
  },
];

export default function addForumStructure() {
  const structure = store.get(STRUCTURE_KEY, DEFAULT_STRUCTURE);
  if (structure === DEFAULT_STRUCTURE) {
    getStructure();
  }
  addToHTML(structure);
  store.onChange(addToHTML);
  observeDOM(document.body, { childList: true }, (mutations) => {
    if ($('#next-navigation-structure').length > 0) return;
    mutations.forEach(mut => {
      mut.addedNodes.forEach(node => {
        if (node.classList.contains('offCanvasMenu--nav')) {
          const structure = store.get(STRUCTURE_KEY, DEFAULT_STRUCTURE);
          addToHTML(structure);
        }
      });
    });
  });
}

function addToHTML(structure) {
  const $firstLi = $('.offCanvasMenu-list > li:first');
  const newHTML = (
    `<li id="next-navigation-structure">
      <div class="offCanvasMenu-linkHolder">
        <a href="https://next.voz.vn" class="offCanvasMenu-link" data-xf-key="1" data-nav-id="home">Home</a>
        <a class="offCanvasMenu-link offCanvasMenu-link--splitToggle" data-xf-click="toggle" data-target="< :up :next" role="button" tabindex="0"></a>
      </div>
      <ul class="offCanvasMenu-subList" style="" tabindex="-1">
      ${structure.map(({ url, title, boxes }) => `
        <li>
          <a
            href="${url}"
            class="u-indentDepth0 js-offCanvasCopy offCanvasMenu-link"
            data-nav-id="${title}"
            >${title}</a>
        </li>
        ${boxes.map(({ url, title }) => `<li>
          <a
            href="${url}"
            class="u-indentDepth1 js-offCanvasCopy offCanvasMenu-link"
            data-nav-id="${title}"
            >${title}</a>
        </li>`).join('\n')}
      `).join('\n')}
      </ul>
    </li>`
  );
  $firstLi.replaceWith($(newHTML));
}

async function getStructure() {
  const html = await request('https://next.voz.vn/', { doNotParse: true });
  const $doc = $(html);
  const $fs = $doc.find('.block.block--category');
  const struct = [];
  $fs.each((_i, node) => {
    const $h2 = $(node).find('h2 a');
    const f = {
      title: $h2.text(),
      url: $h2.attr('href'),
      boxes: [],
    };
    const $h3s = $(node).find('h3 a');
    $h3s.each((_j, boxNode) => {
      f.boxes.push({
        title: $(boxNode).text(),
        url: $(boxNode).attr('href'),
      });
    });
    struct.push(f);
  });

  store.set(STRUCTURE_KEY, struct);
}
