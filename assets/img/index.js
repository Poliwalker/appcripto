//llamamos a todos los elementos del html que vamos a utilizar para armar la logica

const tbody = document.querySelector('.tbody'); // donde imprimimos las monedas
const prevBTN = document.querySelector('.left'); // boton de paginacion izquierda
const nextBTN = document.querySelector('.right'); // boton paginacion derecha
const pageNumber = document.querySelector('.page-number'); // numero de pagina actual
const form = document.querySelector('.form'); // formulario donde tenemos el input
const searchInput = document.querySelector('.input-search'); // input
const top100 = document.querySelector('.top-btn'); // boton donde renderizamos el top 100
const btnContainer = document.querySelector('.pagination'); // contenedor donde esta la los botones y el numero de pagina

// Función para formatear los numeros
const formatearNumero = (num) => {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

//Funcion para formatear el marketCup y el volumen x 24hs
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

// funcion que muestra lo que se va a imprimir en el HTML, en porcentaje de 24hs y en el porcentaje semanal en su clase tiene una funcion la cual va a imprimir verde o rojo segun si bajó o subió (porcent 24 hs < 0 imprimi la clase 'down sino imprimi la clase 'up)
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

// Función para la logica de renderizado
const renderCoins = (coins, current) => {
	//La funcion Va a tener dos parametros las coins y el estado actual
	if (!coins.length) {
		// si no tenemos monedas imprimime en el html que no se encontró la moneda que buscamos
		tbody.innerHTML = `<h1>No se encontró la moneda...realize una nueva busqueda</h1>`;
		top100.classList.remove('hidden'); // al boton TOP100 hacemos que aparezca sacando la clase que hace que se oculte
		btnContainer.classList.add('hidden'); // a la vez le ponemos la clase ocultar al contenedor de los botones de paginación
		form.reset(); // reseteamos el input
		return; // retornamos, esta parte hace la logica en caso de que no encuentre nada.
	}

	// esta logica va a ser en caso de que se encuentre algo en la busqueda.
	btnContainer.classList.remove('hidden'); // removemos la clase hidden y se muestra los botones de la paginación
	tbody.innerHTML = coins[current].map(renderCoin).join(''); // monedas le vamos a pasar el current que seria la pagina en la que estamos la cual va a ser la que se va a imprimir en el HTML, utilizamos el metodo MAP(crea un nuevo array con los resultados de la llamada a la funcion indicada, en nuestro caso, seria el elemento actual del array que se está procesando) y vamos a mapear render coin que seria lo que vamos a imprimir en el HTML y le ponemos el join('') que va a eliminar las comas cuando le pasemos entre comillas vacio
};

//esta funcion va a resetear cuando hagamos una busqueda
const resetCount = (coins) => {
	// parametro coin
	//esto va a devolver un objeto
	prev = coins.prev;
	current = coins.current;
	next = coins.next;
	total = coins.total;
	results = coins.results;
};

//Funcion para aplicar la clase si llegamos al principio de todo con el boton prev y cuando se carga la pagina
const disabledPreviousBTN = (prev) => {
	if (prev === null) {
		// si prev === null entonces aplica la clase disabled
		prevBTN.classList.add('disabled');
	} else {
		// si no es asi saca la clase disabled
		prevBTN.classList.remove('disabled');
	}
};

//funcion para aplicar al clase si llegamos al final del boton next
const disabledNextBTN = (next, total) => {
	if (next === total) {
		// si next es igual a total agregame la clase disabled
		nextBTN.classList.add('disabled');
	} else {
		// sino sacame la clase disabled
		nextBTN.classList.remove('disabled');
	}
};

const loadCoins = async (e) => {
	// funcion maestra que nos trae la data y la ejecuta; le tenemos que indicar que es asincrona porque se va a ejecutar con lo que le pasemos con el fetch que armamos en el request coin
	e.preventDefault(); // previene que se carga la pagina por defecto

	const searchedValue = searchInput.value.trim(); //armamos una const para capturar el valor del input, le pasamos el metodo trim() para eleminar los espacios
	let coins = await requestCoins(searchedValue); // creamos una variable para llamar a la funcion requesCoin que habiamos creado para llamar a la api y traernos los datos, asi mismo tenemos que indicarle que tiene que aguardar una respuesta (await)
	resetCount(coins); // va a resetear las monedas cuando las estemos buscando

	if (searchedValue) {
		// si obtenemos un valor en el input cuando apretamos el boton de buscar:
		top100.classList.remove('hidden'); // le sacamos la clase hidden al boton para que se muestre
		form.reset(); //reseteamos el formulario
	} else {
		// sino encuentra ningun valor
		top100.classList.add('hidden'); // a nuestro boton top100 le ponemos la clase hidden para ocultarlo
	}

	pageNumber.innerHTML = current + 1; // vamos a indicar que el numero de la pagina en la que estamos arranque en 1, si no le sumaramos 1 al estado actual empezaria en 0 por la posición del array entonces ya con esto nos aseguramos que arranque en 1
	renderCoins(results, current); // a esta funcion le pasamos los parametros results y current que los vamos a usar en la logica de renderizado
	disabledPreviousBTN(prev); // llamamos a la funcion con su parametro que usamos para la logica
	disabledNextBTN(next, total); // llamamos a la funcion con los parametros que usamos en la logica
	//logica del boton prev y next //

	//logica del boton next
	nextBTN.addEventListener('click', (e) => {
		// escuchador de eventos tipo click. cuando clickeamos ejecuta la función
		e.stopImmediatePropagation(); // evitamos que se pase de largo cuando carge la pagina o me carge mal.
		if (next === total) return; // si next = total no queremos que haga nada mas
		// sino modificame el boton previoel cual:
		prev = current; // el boton prev es igual al la pagina actual
		current += 1; // current le tenemos que sumar 1 (ej pag 5 = 5 + 1)
		next += 1; // next tenemos que sumarle 1 (ej pag 3 = 3 + 1)
		renderCoins(results, current); // una vez armada la logica renderizamos las monedas con sus parametros
		pageNumber.innerHTML = current + 1; // modificamos el numero de pagina que es igual a el estado actual + 1
		disabledPreviousBTN(prev); // llamamos a la funcion con su parametro que usamos para la logica
		disabledNextBTN(next, total); // llamamos a la funcion con los parametros que usamos en la logica
	});

	// logica del boton prev
	prevBTN.addEventListener('click', (e) => {
		// escuchador de eventos tipo click. cuando clickeamos ejecuta la función
		e.stopImmediatePropagation(); // evitamos que se pase de largo cuando carge la pagina o me carge mal.
		if (prev === null) return; // si el prev es igual a vacio o sea que llego hasta el principio retorna no hace mas nada
		// sino:
		current -= 1; // el estado actual va a ser el estado actual - 1 (pagina 3 = 3 - 1)
		prev = prev === 0 ? null : prev - 1; // prev tiene una condicion si es === 0 retorna vacio sino seria la pagina actual - 1 seria el prev
		next -= -1; // next le tenemos que restar - 1 (ej pag 4 = 4 - 1 )
		pageNumber.innerHTML = current + 1; // cuando cambiamos de pagina vamos a imprimir  en el html  la pagina actual + 1
		renderCoins(results, current); // una vez armada la logica renderizamos las monedas con sus parametros
		disabledPreviousBTN(prev); // llamamos a la funcion con su parametro que usamos para la logica
		disabledNextBTN(next, total); // llamamos a la funcion con los parametros que usamos en la logica
	});
};

const init = () => {
	// funcion que va a inicializar el DOM
	window.addEventListener('DOMContentLoaded', loadCoins); // cuando carga la pagina queremos que imprima el estado actual del array con la funcion loadCoins y el escuchador de eventos 'DOMcontentLoader'
	form.addEventListener('submit', loadCoins); // le agregamos un escuchador de eventos de tipo submit que cuando mandemos el formulario ejecuta la funcion loadCoins.
	top100.addEventListener('click', loadCoins); // le agregamos un escuchando de eventos al boton TOP100 que cuando clickemos va a ejecutar la funcion loadCoins
};

init();
