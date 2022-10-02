const requestCoins = async (value) => {
	// funcion para llamar a la api cripto, se le pasa el termino async ya que es asincrona la funcion y se va a ejecutar cuando este lista
	const baseURL = `https://api.coinlore.net/api/tickers/?start=0&limit=100`; //armamos una constante para traernos en enlace URL y modificamos el start
	const response = await fetch(baseURL); // armamos constante usamos el fetch para ejecutar la api y ponemos await para que sepa que tenemos que esperar una respuesta
	const json = await response.json(); // a esa info de la api tenemos que transformarla en un json que nos permita leer la informacion la armamos en una constante
	const data = json.data; // y de ese json nos traemos la data

	const results = value
		? divideArray(
				data.filter((coin) =>
					coin.name.toLowerCase().includes(value.toLowerCase())
				),
				10 // este numero nos trae la cantidad de resultados que queremos ver cuando hagamos la busqueda de una moneda
		  )
		: divideArray(data, 10); // este numero nos muestra la cantidad de monedas que quiero ver por pagina

	// nos armamos una funcion para buscar el valor del input. ponemos una cosnt results que va a ser igual a un valor(value) que lo pasamos como parametro en nuestra funcion. y usamos el ternario o if. ?(verdadero), :(falso). filtamos nuestra data con el metodo filter(crea un nuevo array con el elementos que cumplan la condición) adentro del filter le pasamos el parametro "coin" y con el arrow funtion buscamos a coin.name y a la vez tenemos que usar un metodo de string para pasarlas a minusculas para que el buscador me las tome ya que en la api estan con mayuscula. entonces usamos el metodo toLowerCase(), y a la vez tenemos que pasarle con el metodo includes() el valor que pongamos en el input y tambien lo tenemos que pasar a toLowerCase().

	// si cae en falso porque no pasamos un valor en el input llamamos a la funcion divide array porque quiero que me muestre todas las monedas. y a esa funcion le pasamos los parametros(nuestra data de la api, y el numero el cual queremos dividir los 100 resultados de la api)
	return {
		results: results,
		total: results.length,
		current: 0,
		prev: null,
		next: 1,
	};

	// la funcion va a devolver objetos para poder manejar la paginacion un resultado = resultados obtenidos o todos los arrays; total = resultado por el largo del array; current = 0, (elemento actual del array que renderizamos en cada pagina); prev = null(paginacion previa, arranca en null porque no queremos que valla para atras porque no hay pagina previa); next = 1 (para la paginacion sigiente)
};

function divideArray(arr, size) {
	// armamos uan funcion para dividir nuestra pagina en 10 coins, parametrizamos con un array y un tamaño
	let chunk = []; //  en una variable let ponemos un array vacio
	for (let i = 0; i < arr.length; i += size) {
		chunk.push(arr.slice(i, i + size));
	}

	//* usamos el metodo FOR el cual tiene 3 partes = 1. un iniciador el cual va a ser igual a 0; 2. una condicion la cual le vamos a pasar que nuestro i va a ser menor al largo del array; 3. por ultimo el incrementador (Asignación de adición	x += y	x = x + y) el cual se traduciria como i = i + size. entonces cada vez que recorra el for va a ir de 10 en 10 for( let i = 10; 10 < largo del array; 10(vuelta) = 10(vuelta) + 10(size)) *
	// * a ese array le vamos a pasar 2 metodos : 1push(añade uno a mas elementos al array y nos devuelve un nueva largo) y lo que va a pushear son la cantidad de monedas que le pasemos por parametro con el metodo slice(arr.slice([inicio [, fin]])) el cual nos devuelve una copia de una parte del array dentro de un nuevo array sin incluir el final. en tal caso quedaria [chunk.push(arr.slice(0, 0 + 10 ))]

	return chunk;

	// y nos retorna nuestro array con las coins en las partes que le pasemos en el request
}
