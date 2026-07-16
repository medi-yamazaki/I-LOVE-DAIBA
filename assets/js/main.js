let windowWidth = window.innerWidth;

// ======== 本番環境では prdHidden クラスの要素を非表示
if (location.hostname === 'www.fujitv.co.jp') {
	document.querySelectorAll('.prdHidden').forEach(el => el.classList.add('isHidden'));
}

// ======== スクロールアクション
// const els_scrollActionItems = document.querySelectorAll('.js-scrollAction');

// function handleScrollAction() {
// 	const windowWidth = window.innerWidth; // 実行時の幅を取得
// 	const viewportHeight = window.innerHeight;
// 	// 数値が大きすぎると出にくいので、少し調整（100〜150くらいがおすすめ）
// 	const triggerMargin = windowWidth >= 768 ? 100 : 80;

// 	els_scrollActionItems.forEach((el) => {
// 		const rect = el.getBoundingClientRect();
// 		// 判定：画面の高さ > 要素の頭の位置 + 余白
// 		if (viewportHeight > rect.top + triggerMargin) {
// 			el.classList.add('js-scrollAction--show');
// 		}
// 	});
// }

// イベント登録
// window.addEventListener('scroll', handleScrollAction);
// handleScrollAction();

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
		window.scrollTo({
			left: startX + (x - startX) * eased,
			top: startY + (y - startY) * eased,
			behavior: 'instant' // CSSのscroll-behavior:smoothと二重にアニメーションしてカクつくのを防ぐ
		});
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
let el_NaviGlobal = document.querySelector('.NaviGlobal')
let els_HeaderNavLinks = document.querySelectorAll('.NaviGlobal a')
let el_MenuToggle = document.querySelector('.Menu-toggle')
el_MenuToggle.addEventListener('click', function() {
	el_Header.classList.toggle('active');
	el_MenuToggle.classList.toggle('active');
	el_NaviGlobal.classList.toggle('active');
	
	// メニュー開時は背面スクロールを抑止
	if (el_NaviGlobal.classList.contains('active')) {
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
		el_NaviGlobal.classList.remove('active');
		document.body.style.overflow = '';
	});
});

// 外側クリックでメニューを閉じる
document.addEventListener('click', function(e) {
	if (!el_MenuToggle.contains(e.target) && !el_NaviGlobal.contains(e.target)) {
		if (el_NaviGlobal.classList.contains('active')) {
			el_Header.classList.remove('active');
			el_MenuToggle.classList.remove('active');
			el_NaviGlobal.classList.remove('active');
			document.body.style.overflow = '';
		}
	}
});

// ======== 無限スクロールリスト（Marquee）
const MARQUEE_SPEED_PXSEC = 35; // 流れる速さ（px/秒）。画面サイズが変わっても常にこの速さになる

function buildMarquee(el_Marquee, originalItems, el_Track) {
	// 複製分を除去し、元のセットに戻す
	el_Track.innerHTML = '';
	originalItems.forEach(item => el_Track.appendChild(item.cloneNode(true)));

	const originalWidth = el_Track.scrollWidth;
	if (originalWidth <= 0) return; // 幅が測れない場合は複製しない（無限ループ防止）

	// コンテナ幅 + 1セット分を超えるまで複製し、シームレスにループさせる（無限ループ防止のため複製回数に上限を設ける）
	let loopCount = 0;
	while (el_Track.scrollWidth < el_Marquee.clientWidth + originalWidth && loopCount < 50) {
		originalItems.forEach(item => el_Track.appendChild(item.cloneNode(true)));
		loopCount++;
	}

	// 距離に応じて再生時間を決めることで、画面サイズが変わっても見た目の速さ（px/秒）を一定にする
	el_Marquee.style.setProperty('--marquee-distance', `${originalWidth}px`);
	el_Marquee.style.setProperty('--marquee-duration', `${originalWidth / MARQUEE_SPEED_PXSEC}s`);
}

document.querySelectorAll('.js-marquee').forEach((el_Marquee) => {
	const el_Track = el_Marquee.querySelector('.Marquee-track');
	if (!el_Track) return;

	const originalItems = Array.from(el_Track.children);
	let resizeTimer;

	buildMarquee(el_Marquee, originalItems, el_Track);
	window.addEventListener('load', () => buildMarquee(el_Marquee, originalItems, el_Track));
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => buildMarquee(el_Marquee, originalItems, el_Track), 200);
	});
});

// ======== NEWSリストの「and more」展開
document.querySelectorAll('.js-NewsMore').forEach(el_More => {
	const el_List = el_More.closest('section').querySelector('.NewsListContainer');
	const el_MoreWrap = el_More.closest('.js-NewsMoreWrap');
	if (!el_List || !el_MoreWrap) return;

	function updateNewsMoreVisibility() {
		const limit = window.innerWidth <= 767 ? 4 : 5;
		const isExpanded = el_List.classList.contains('is-expanded');
		const hasMore = el_List.children.length > limit;
		el_MoreWrap.style.display = (isExpanded || !hasMore) ? 'none' : '';
	}

	el_More.addEventListener('click', (e) => {
		e.preventDefault();
		el_List.classList.add('is-expanded');
		updateNewsMoreVisibility();
	});

	updateNewsMoreVisibility();
	window.addEventListener('resize', updateNewsMoreVisibility);
});


// ======== NEWS モーダル
const el_NewsModalWrap = document.querySelector('.NewsModalWrap');
const el_NewsModalArticle = document.querySelector('.NewsModalArticleWrap');
const el_NewsModalClose = document.querySelector('.NewsModalClose');
const el_NewsModalBg = document.querySelector('.NewsModalWrap .ComModalBg');
const els_NewsListContainerLi = document.querySelectorAll('.NewsListContainer li:not(.link)');

// NEWSリストの各要素に対するループ処理
els_NewsListContainerLi.forEach(el_Item => {
	el_Item.addEventListener('click', (e) => {
		// aタグ（公式サイトのURL等）を直接踏んだらモーダルは開かない
		if (e.target.tagName === 'A') return;

		// データの抽出
		const img = el_Item.querySelector('.NewsKV').innerHTML;
		const date = el_Item.querySelector('time').innerText;
		const title = el_Item.querySelector('h3').innerHTML;
		const body = el_Item.querySelector('.js-ModalParts').innerHTML;

		// モーダル内を構築
		el_NewsModalArticle.innerHTML = `
			<div class="NewsModalHeader">
				<div class="NewsModalKV">${img}</div>
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
const el_SectionKV = document.querySelector('.Section-KV');
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
if (el_pagetop) observer.observe(el_SectionKV);

// クリックイベント：自作の smoothScroll 関数を利用
if (el_pagetop) {
	el_pagetop.addEventListener('click', (e) => {
		e.preventDefault();

		// 自作関数 smoothScroll(対象, 開始x, 終了y, 時間) を呼び出す
		// 468ms かけて y=0 までスクロール
		smoothScroll(window, window.pageXOffset, 0, 468);
	});
}