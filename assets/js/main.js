let windowWidth = window.innerWidth;

// ======== 本番環境では prdHidden クラスの要素を非表示
if (location.hostname === 'www.fujitv.co.jp') {
	document.querySelectorAll('.prdHidden').forEach(el => el.classList.add('isHidden'));
}

// ======== スクロールアクション
const els_scrollActionItems = document.querySelectorAll('.js-scrollAction');

function handleScrollAction() {
	const windowWidth = window.innerWidth; // 実行時の幅を取得
	const viewportHeight = window.innerHeight;
	// 数値が大きすぎると出にくいので、少し調整（100〜150くらいがおすすめ）
	const triggerMargin = windowWidth >= 768 ? 100 : 80;

	els_scrollActionItems.forEach((el) => {
		const rect = el.getBoundingClientRect();
		// 判定：画面の高さ > 要素の頭の位置 + 余白
		if (viewportHeight > rect.top + triggerMargin) {
			el.classList.add('js-scrollAction--show');
		}
	});
}

// イベント登録
window.addEventListener('scroll', handleScrollAction);
handleScrollAction();

// ======== Smooth Scroll Polyfill: 古いブラウザでも { behavior: 'smooth' } を有効化
// 1. スムーズスクロールの本体（iOS/古いブラウザでも動作）
function smoothScroll(element, x, y, duration) {
	const startX = element.scrollLeft || window.pageXOffset;
	const startY = element.scrollTop || window.pageYOffset;
	const startTime = performance.now();

	function ease(t) {
		return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
	}

	function loop() {
		const now = performance.now();
		const time = Math.min(1, (now - startTime) / duration);
		const eased = ease(time);
		window.scrollTo(startX + (x - startX) * eased, startY + (y - startY) * eased);
		if (time < 1) requestAnimationFrame(loop);
	}
	loop();
}

// 2. scrollIntoView を固定ヘッダー対応にカスタム
Element.prototype.scrollIntoView = function() {
	const el_Header = document.querySelector('header');
	const headerHeight = el_Header ? el_Header.offsetHeight : 0;
	
	// 1. 画面幅による分岐（768px以下かどうか）
	const isMobile = window.innerWidth <= 768;
	
	// 2. 要素に応じた追加オフセットの調整
	let extraOffset = isMobile ? -30 : -50;
	
	const rect = this.getBoundingClientRect();
	const targetY = rect.top + window.pageYOffset - headerHeight + extraOffset;
	
	// 自作のsmoothScroll関数を呼び出し
	smoothScroll(window, window.pageXOffset, targetY, 468);
};

// 3. 実行部分（data属性をクリックした時の処理）
document.addEventListener('click', (e) => {
	const target = e.target.closest('[data-scroll]');
	if (!target) return;

	const targetName = target.getAttribute('data-scroll');
	const targetElement = document.querySelector(`[data-target="${targetName}"]`);

	if (targetElement) {
		targetElement.scrollIntoView({ behavior: 'smooth' });
	}
});

// ======== グローバルメニューの開閉処理
let el_Header = document.querySelector('header')
let el_HeaderNav = document.querySelector('header nav')
let els_HeaderNavLinks = document.querySelectorAll('header nav a')
let el_MenuToggle = document.querySelector('.Menu-toggle')
el_MenuToggle.addEventListener('click', function() {
	el_Header.classList.toggle('active');
	el_MenuToggle.classList.toggle('active');
	el_HeaderNav.classList.toggle('active');
	
	// メニュー開時は背面スクロールを抑止
	if (el_HeaderNav.classList.contains('active')) {
		document.body.style.overflow = 'hidden';
	} else {
		document.body.style.overflow = '';
	}
});

// リンククリックでメニューを閉じる
els_HeaderNavLinks.forEach(link => {
	link.addEventListener('click', function() {
		el_Header.classList.remove('active');
		el_MenuToggle.classList.remove('active');
		el_HeaderNav.classList.remove('active');
		document.body.style.overflow = '';
	});
});

// 外側クリックでメニューを閉じる
document.addEventListener('click', function(e) {
	if (!el_MenuToggle.contains(e.target) && !el_HeaderNav.contains(e.target)) {
		if (el_HeaderNav.classList.contains('active')) {
			el_Header.classList.remove('active');
			el_MenuToggle.classList.remove('active');
			el_HeaderNav.classList.remove('active');
			document.body.style.overflow = '';
		}
	}
});

// ======== About Modal機能
const el_AboutModalWrap = document.querySelector('.AboutModalWrap');
const els_PachiKVAbout = document.querySelectorAll('.PachiKV-about');
const el_AboutModalClose = document.querySelector('.AboutModalClose');
const el_AboutComModalBg = document.querySelector('.AboutModalWrap .ComModalBg');

// モーダルを開く
els_PachiKVAbout.forEach(About => {
	About.addEventListener('click', () => {
		document.body.style.overflow = 'hidden'; // スクロール禁止
		el_AboutModalWrap.classList.add('is-open');
		el_AboutModalWrap.setAttribute('aria-hidden', 'false');
	});
})

// モーダルを閉じる関数
const closeAboutModal = () => {
	el_AboutModalWrap.classList.remove('is-open');
	document.body.style.overflow = ''; // スクロール復帰
	el_AboutModalWrap.classList.remove('is-open');
	el_AboutModalWrap.setAttribute('aria-hidden', 'true');
};

el_AboutModalClose.addEventListener('click', (e) => {
	e.preventDefault();
	closeAboutModal();
});

// // 背景クリックでも閉じる
el_AboutComModalBg.addEventListener('click', closeAboutModal);


// ======== Corner モーダル
const el_CornerModalWrap = document.querySelector('.CornerModalWrap');
const el_CornerModalArticle = document.querySelector('.CornerModalArticle');
const el_CornerModalClose = document.querySelector('.CornerModalClose');
const el_CornerModalBg = document.querySelector('.CornerModalWrap .ComModalBg');
const els_CornerEggListLi = document.querySelectorAll('.Corner-EggList li');

// Cornerリストの各要素に対するループ処理
els_CornerEggListLi.forEach(el_Item => {
	el_Item.addEventListener('click', (e) => {
		if (e.target.tagName === 'A') return;

		// まず .ModalParts があるか探す
		const modalContent = el_Item.querySelector('.ModalParts');
		// 中身がなかったら、ここで処理を終了（エラーを回避）
		if (!modalContent) {
			return; 
		}

		// あった場合のみ、中身をコピーしてモーダルを開く
		const body = modalContent.innerHTML;
		el_CornerModalArticle.innerHTML = body;

		el_CornerModalWrap.classList.add('is-open');
		el_CornerModalWrap.setAttribute('aria-hidden', 'false');
		document.body.style.overflow = 'hidden'; 
	});
});

// 閉じる関数
const closeCornerModal = () => {
	el_CornerModalWrap.classList.remove('is-open');
	el_CornerModalWrap.setAttribute('aria-hidden', 'true');
	document.body.style.overflow = '';
};

// 閉じるボタン または 背景クリックで閉じる
el_CornerModalClose.addEventListener('click', closeCornerModal);
el_CornerModalBg.addEventListener('click', closeCornerModal);


// ======== NEWS モーダル
const el_NewsModalWrap = document.querySelector('.NewsModalWrap');
const el_NewsModalArticle = document.querySelector('.NewsModalArticle');
const el_NewsModalClose = document.querySelector('.NewsModalClose');
const el_NewsModalBg = document.querySelector('.NewsModalWrap .ComModalBg');
const els_NewsListContainerLi = document.querySelectorAll('.NewsListContainer li:not(.link)');

// NEWSリストの各要素に対するループ処理
els_NewsListContainerLi.forEach(el_Item => {
	el_Item.addEventListener('click', (e) => {
		// aタグ（公式サイトのURL等）を直接踏んだらモーダルは開かない
		if (e.target.tagName === 'A') return;

		// データの抽出
		const date = el_Item.querySelector('time').innerText;
		const title = el_Item.querySelector('h3').innerHTML;
		const body = el_Item.querySelector('.ModalParts').innerHTML;

		// モーダル内を構築
		el_NewsModalArticle.innerHTML = `
			<div class="NewsModalHeader">
				<time>${date}</time>
				<h2>${title}</h2>
			</div>
			<div class="NewsModalMain">
				${body}
			</div>
		`;

		// モーダル展開
		el_NewsModalWrap.classList.add('is-open');
		el_NewsModalWrap.setAttribute('aria-hidden', 'false');
		document.body.style.overflow = 'hidden'; // 背景スクロール固定
	});
});

// 閉じる関数
const closeNewsModal = () => {
	el_NewsModalWrap.classList.remove('is-open');
	el_NewsModalWrap.setAttribute('aria-hidden', 'true');
	document.body.style.overflow = '';
};

// 閉じるボタン または 背景クリックで閉じる
el_NewsModalClose.addEventListener('click', closeNewsModal);
el_NewsModalBg.addEventListener('click', closeNewsModal);


// ======== ページトップスクロール
const el_SectionPachiKV = document.querySelector('.Section-PachiKV');
const el_pagetop = document.querySelector('.js-pagetop');

// 監視オプション（KVが10%でも見えていれば「表示中」とみなす）
const options = {
	root: null,
	rootMargin: "0px",
	threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			el_pagetop.classList.remove('is-show');
		} else {
			el_pagetop.classList.add('is-show');
		}
	});
}, options);

// 監視開始
if (el_pagetop) observer.observe(el_SectionPachiKV);

// クリックイベント：自作の smoothScroll 関数を利用
el_pagetop.addEventListener('click', (e) => {
	e.preventDefault();
	
	// 自作関数 smoothScroll(対象, 開始x, 終了y, 時間) を呼び出す
	// 468ms かけて y=0 までスクロール
	smoothScroll(window, window.pageXOffset, 0, 468);
});