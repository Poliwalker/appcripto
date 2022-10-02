const tbody = document.querySelector('.tbody');
const prevBTN = document.querySelector('.left');
const nextBTN = document.querySelector('.right');
const pageNumber = document.querySelector('.page-number');
const form = document.querySelector('.form');
const searchInput = document.querySelector('.input-search');
const top100 = document.querySelector('.top-btn');
const btnContainer = document.querySelector('.pagination');

const formatearNumero = (num) => {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const nFormatter = (num, digits) => {
	const symbol = [
		{ value: 1, symbol: '' },
		{ value: 1e3, symbol: 'k' },
		{ value: 1e6, symbol: 'M' },
		{ value: 1e9, symbol: 'MM' },
	];

	const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;

	let item = symbol
		.slice()
		.reverse()
		.find((item) => {
			return num >= item.value;
		});

	return item
		? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol
		: '0';
};

const renderCoin = (coin) => {
	const {
		rank,
		market_cap_usd,
		name,
		symbol,
		price_usd,
		volume24,
		percent_change_24h,
		percent_change_7d,
	} = coin;
	return `<tr>
	<td>#${rank}</td>
	<td class="coin-title">${name} (${symbol})</td>
	<td>$${price_usd}</td>
	<td>$${nFormatter(market_cap_usd)}</td>
	<td>$${nFormatter(volume24)}</td>
	<td><span class="${
		percent_change_24h < 0 ? 'down' : 'up'
	}">${percent_change_24h}</span></td>
	<td><span class="${
		percent_change_7d < 0 ? 'down' : 'up'
	}">${percent_change_7d}</span></td>
  </tr>`;
};

const renderCoins = (coins, current) => {
	if (!coins.length) {
		tbody.innerHTML = `<h1>No se encontró la moneda...realize una nueva busqueda</h1>`;
		top100.classList.remove('hidden');
		btnContainer.classList.add('hidden');
		form.reset();
		return;
	}

	// ⚠ Porque utiliza negando coin por el largo ⚠

	btnContainer.classList.remove('hidden');
	tbody.innerHTML = coins[current].map(renderCoin).join('');
};

const resetCount = (coins) => {
	prev = coins.prev;
	current = coins.current;
	next = coins.next;
	total = coins.total;
	results = coins.results;
};

const disabledPreviousBTN = (prev) => {
	if (prev === null) {
		prevBTN.classList.add('disabled');
	} else {
		prevBTN.classList.remove('disabled');
	}
};

const disabledNextBTN = (next, total) => {
	if (next === total) {
		nextBTN.classList.add('disabled');
	} else {
		nextBTN.classList.remove('disabled');
	}
};

const loadCoins = async (e) => {
	e.preventDefault();

	const searchedValue = searchInput.value.trim();
	let coins = await requestCoins(searchedValue);
	resetCount(coins);

	if (searchedValue) {
		top100.classList.remove('hidden');
		form.reset();
	} else {
		top100.classList.add('hidden');
	}
	pageNumber.innerHTML = current + 1;
	renderCoins(results, current);
	disabledPreviousBTN(prev);
	disabledNextBTN(next, total);

	nextBTN.addEventListener('click', (e) => {
		e.stopImmediatePropagation();
		if (next === total) return;
		prev = current;
		current += 1;
		next += 1;
		renderCoins(results, current);
		pageNumber.innerHTML = current + 1;
		disabledPreviousBTN(prev);
		disabledNextBTN(next, total);
	});
	prevBTN.addEventListener('click', (e) => {
		e.stopImmediatePropagation();
		if (prev === null) return;
		current -= 1;
		prev = prev === 0 ? null : prev - 1;
		next -= -1;
		pageNumber.innerHTML = current + 1;
		renderCoins(results, current);
		disabledPreviousBTN(prev);
		disabledNextBTN(next, total);
	});
};

const init = () => {
	window.addEventListener('DOMContentLoaded', loadCoins);
	form.addEventListener('submit', loadCoins);
	top100.addEventListener('click', loadCoins);
};

init();
