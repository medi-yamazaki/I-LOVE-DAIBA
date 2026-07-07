// ============================================================
// カスタムスクロールバー共通処理
// ============================================================
// 【使い方】
// スクロールさせたい要素に js-CustomScrollbar クラスを付与するだけで適用される。
// 縦・横どちらも同じクラス一つで対応。CSSのoverflowの指定で自動判定される。
//   overflow-y: auto → 縦スクロールバーを生成
//   overflow-x: auto → 横スクロールバーを生成
//   両方指定         → 縦横どちらも生成
//
// 通常ページ：DOMContentLoaded のタイミングで自動初期化
// modaal内 ：.js-ModalExplain / .js-ModalConf のクリックを検知して自動初期化
//
// 【CSS要件】
// js-CustomScrollbar を付与した要素   : overflow-y / overflow-x を auto で指定
// js-CustomScrollbar を付与した要素の親: position: relative（スクロールバーの配置基準）
//
// 【スクロールバーの生成場所】
// スクロールバー要素（縦：.comScrollbar / 横：.comScrollbar.is-x）は
// js-CustomScrollbar を付与した要素の「親要素」の末尾に追加される。
//
// 【対応デバイス】
// PC（マウス操作）のみ適用。SP・タブレットはタッチスクロールで代替するため適用しない。
// ============================================================

// 登録済みの update 関数を管理する（リサイズ時に全件再計算するため）
const data_scrollbarRegistry = new Map();

function initCustomScrollbar(el_Scroll) {
	// 既に登録済みの場合はスタイル再計算のみ（DOM 再生成なし）
	if (data_scrollbarRegistry.has(el_Scroll)) {
		data_scrollbarRegistry.get(el_Scroll)();
		return;
	}

	const el_Parent = el_Scroll.parentElement;
	let el_ScrollBar = null;
	let el_ScrollBarThumb = null;

	// スクロールバー要素を生成して親要素に追加する（初回オーバーフロー時のみ呼ばれる）
	function create() {
		el_ScrollBar = document.createElement('div');
		el_ScrollBar.className = 'comScrollbar';
		el_ScrollBarThumb = document.createElement('div');
		el_ScrollBarThumb.className = 'comScrollbar-Thumb';
		el_ScrollBar.appendChild(el_ScrollBarThumb);
		el_Parent.appendChild(el_ScrollBar);

		let data_startY, data_startScrollTop;
		el_ScrollBarThumb.addEventListener('mousedown', e => {
			data_startY = e.clientY;
			data_startScrollTop = el_Scroll.scrollTop;
			e.preventDefault();
			document.addEventListener('mousemove', onDrag);
			document.addEventListener('mouseup', onDragEnd);
		});
		function onDrag(e) {
			const data_delta = e.clientY - data_startY;
			const data_thumbH = parseFloat(el_ScrollBarThumb.style.height);
			const data_maxScrollTop = el_Scroll.scrollHeight - el_Scroll.clientHeight;
			el_Scroll.scrollTop = data_startScrollTop + (data_delta / (el_ScrollBar.clientHeight - data_thumbH)) * data_maxScrollTop;
		}
		function onDragEnd() {
			document.removeEventListener('mousemove', onDrag);
			document.removeEventListener('mouseup', onDragEnd);
		}

		el_Scroll.addEventListener('scroll', updateThumb);
	}

	// サムの高さと位置を更新する
	function updateThumb() {
		if (!el_ScrollBar) return;
		const data_ratio = el_Scroll.clientHeight / el_Scroll.scrollHeight;
		const data_thumbH = Math.max(el_ScrollBar.clientHeight * data_ratio, 20);
		const data_maxScrollTop = el_Scroll.scrollHeight - el_Scroll.clientHeight;
		const data_thumbMaxTop = el_ScrollBar.clientHeight - data_thumbH;
		const data_thumbTop = data_maxScrollTop > 0
			? (el_Scroll.scrollTop / data_maxScrollTop) * data_thumbMaxTop
			: 0;
		el_ScrollBarThumb.style.height = data_thumbH + 'px';
		el_ScrollBarThumb.style.top = data_thumbTop + 'px';
	}

	// スクロールの必要性に応じてバーの表示・寸法を更新する（DOM 再生成なし）
	function update() {
		if (el_Scroll.scrollHeight <= el_Scroll.clientHeight) {
			if (el_ScrollBar) el_ScrollBar.style.display = 'none';
			return;
		}
		if (!el_ScrollBar) create();
		el_ScrollBar.style.display = '';
		el_ScrollBar.style.top = el_Scroll.offsetTop + 'px';
		el_ScrollBar.style.height = el_Scroll.offsetHeight + 'px';
		updateThumb();
	}

	update();
	data_scrollbarRegistry.set(el_Scroll, update);

	// 要素サイズの変化をリアルタイムで監視してバーを即時更新する
	// rAFで1フレームに1回に絞り、トランジション中の過剰発火を防ぐ
	let data_rafId = null;
	const data_resizeObserver = new ResizeObserver(() => {
		if (data_rafId) cancelAnimationFrame(data_rafId);
		data_rafId = requestAnimationFrame(() => {
			update();
			data_rafId = null;
		});
	});
	data_resizeObserver.observe(el_Scroll);
	// 直下の子要素も監視してスクロールコンテンツの変化（アコーディオン展開等）を検知する
	Array.from(el_Scroll.children).forEach(child => data_resizeObserver.observe(child));
}

// ============================================================
// 横スクロールバー
// ============================================================
const data_scrollbarXRegistry = new Map();

function initCustomScrollbarX(el_Scroll) {
	if (data_scrollbarXRegistry.has(el_Scroll)) {
		data_scrollbarXRegistry.get(el_Scroll)();
		return;
	}

	const el_Parent = el_Scroll.parentElement;
	let el_ScrollBarX = null;
	let el_ScrollBarXThumb = null;

	function create() {
		el_ScrollBarX = document.createElement('div');
		el_ScrollBarX.className = 'comScrollbar is-x';
		el_ScrollBarXThumb = document.createElement('div');
		el_ScrollBarXThumb.className = 'comScrollbar-Thumb';
		el_ScrollBarX.appendChild(el_ScrollBarXThumb);
		el_Parent.appendChild(el_ScrollBarX);

		let data_startX, data_startScrollLeft;
		el_ScrollBarXThumb.addEventListener('mousedown', e => {
			data_startX = e.clientX;
			data_startScrollLeft = el_Scroll.scrollLeft;
			e.preventDefault();
			document.addEventListener('mousemove', onDrag);
			document.addEventListener('mouseup', onDragEnd);
		});
		function onDrag(e) {
			const data_delta = e.clientX - data_startX;
			const data_thumbW = parseFloat(el_ScrollBarXThumb.style.width);
			const data_maxScrollLeft = el_Scroll.scrollWidth - el_Scroll.clientWidth;
			el_Scroll.scrollLeft = data_startScrollLeft + (data_delta / (el_ScrollBarX.clientWidth - data_thumbW)) * data_maxScrollLeft;
		}
		function onDragEnd() {
			document.removeEventListener('mousemove', onDrag);
			document.removeEventListener('mouseup', onDragEnd);
		}

		el_Scroll.addEventListener('scroll', updateThumb);
	}

	function updateThumb() {
		if (!el_ScrollBarX) return;
		const data_ratio = el_Scroll.clientWidth / el_Scroll.scrollWidth;
		const data_thumbW = Math.max(el_ScrollBarX.clientWidth * data_ratio, 20);
		const data_maxScrollLeft = el_Scroll.scrollWidth - el_Scroll.clientWidth;
		const data_thumbMaxLeft = el_ScrollBarX.clientWidth - data_thumbW;
		const data_thumbLeft = data_maxScrollLeft > 0
			? (el_Scroll.scrollLeft / data_maxScrollLeft) * data_thumbMaxLeft
			: 0;
		el_ScrollBarXThumb.style.width = data_thumbW + 'px';
		el_ScrollBarXThumb.style.left = data_thumbLeft + 'px';
	}

	function update() {
		if (el_Scroll.scrollWidth <= el_Scroll.clientWidth) {
			if (el_ScrollBarX) el_ScrollBarX.style.display = 'none';
			return;
		}
		if (!el_ScrollBarX) create();
		el_ScrollBarX.style.display = '';
		el_ScrollBarX.style.left = el_Scroll.offsetLeft + 'px';
		el_ScrollBarX.style.width = el_Scroll.offsetWidth + 'px';
		updateThumb();
	}

	update();
	data_scrollbarXRegistry.set(el_Scroll, update);

	let data_rafId = null;
	const data_resizeObserver = new ResizeObserver(() => {
		if (data_rafId) cancelAnimationFrame(data_rafId);
		data_rafId = requestAnimationFrame(() => {
			update();
			data_rafId = null;
		});
	});
	data_resizeObserver.observe(el_Scroll);
	Array.from(el_Scroll.children).forEach(child => data_resizeObserver.observe(child));
}

document.addEventListener('DOMContentLoaded', () => {
	if (!window.matchMedia('(pointer: fine)').matches) return;

	function initByComputedStyle(el) {
		const style = getComputedStyle(el);
		if (style.overflowY === 'auto' || style.overflowY === 'scroll') initCustomScrollbar(el);
		if (style.overflowX === 'auto' || style.overflowX === 'scroll') initCustomScrollbarX(el);
	}

	// 通常ページの自動初期化
	document.querySelectorAll('.js-CustomScrollbar').forEach(el => initByComputedStyle(el));

	// modaal内をオープン後に自動初期化
	document.querySelectorAll('.js-ModalExplain, .js-ModalConf').forEach(el_Trigger => {
		el_Trigger.addEventListener('click', () => {
			setTimeout(() => {
				document.querySelectorAll('.modaal-content-container .js-CustomScrollbar').forEach(el => initByComputedStyle(el));
			}, 300);
		});
	});


});
