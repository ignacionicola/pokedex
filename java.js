const API_BASE = 'https://pokeapi.co/api/v2/pokemon';

// Cuando la página carga se ejecuta la función
document.addEventListener('DOMContentLoaded', () => {
  cargarPokemons(50); // Carga los primeros 50 Pokémon
});

// Función para cargar los Pokémons
async function cargarPokemons(cantidad) {
  const container = document.getElementById('pokemon-container'); // Contenedor donde se mostrarán los Pokémon
  container.innerHTML = 'Cargando...'; // Mensaje mientras se cargan los datos

  const pokemons = []; // Aquí se guardan  las promesas de los Pokémon
  for (let i = 1; i <= cantidad; i++) {
    // Realizo una petición para cada Pokémon
    pokemons.push(
      fetch(`${API_BASE}/${i}`)
        .then(res => res.json()) // Se convierte la respuesta a JSON
        .catch(() => null) // Si falla, devolvemos null
    );
  }

  const resultados = (await Promise.all(pokemons)).filter(pokemon => pokemon);  // Filtra los que fallaron
  container.innerHTML = ''; // Limpio el contenedor

  // Muestro cada pokémon en el contenedor
  resultados.forEach(pokemon => {
    container.innerHTML += crearCarta(pokemon);
  });
}

// Función para crear la tarjeta de un Pokémon
function crearCarta(pokemon) {
  // Se obtienen los tipos del Pokémon
  const tipos = pokemon.types
    ? pokemon.types.map(t => `<span>${t.type.name}</span>`).join('') // Si tiene tipos, se mueestra
    : '<span>Desconocido</span>'; // Si no tiene tipos, muestra "Desconocido"

  // Se obtiene  la imagen del Pokémon o una imagen por defecto
  const imagen = pokemon.sprites?.front_default || 'placeholder.png';

  // Se devuelve el HTML de la tarjeta
  return `
    <div class="card">
      <h3>${pokemon.name}</h3>
      <img src="${imagen}" alt="${pokemon.name}">
      <div class="types">${tipos}</div>
      <p>Weight: ${pokemon.weight || 'Desconocido'}kg</p>
    </div>
  `;
}

// Función para buscar un Pokémon por nombre
async function buscarPokemon() {
  const nombre = document.getElementById('search').value.toLowerCase(); // Se obtiene el nombre del input
  const container = document.getElementById('pokemon-container'); // Contenedor donde se mostrará el resultado
  if (!nombre) return; // Si no hay nombre, no se hace nada

  try {
    container.innerHTML = 'Buscando...'; // Mensaje mientras se busca
    const response = await fetch(`${API_BASE}/${nombre}`); // Se hace la petición
    if (!response.ok) throw new Error('No encontrado'); // Si no se encuentra, se lanza  un error
    const pokemon = await response.json(); // Se convierte la respuesta a JSON
    container.innerHTML = crearCarta(pokemon); // Muestra  el Pokémon
  } catch (error) {
    container.innerHTML = `<p>No se encontró el Pokémon "${nombre}". Por favor, verifica el nombre e inténtalo de nuevo.</p>`; // Mensaje de error
  }
}

// Función para filtrar Pokémon por tipo
async function filtrarPorTipo() {
  const tipo = document.getElementById('type-filter').value; // Obtengo el tipo seleccionado
  const container = document.getElementById('pokemon-container'); // Contenedor donde se mostrarán los resultados
  container.innerHTML = 'Cargando...'; // Mensaje mientras se cargan los datos

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`); // Realizo la petición al endpoint de tipos
    const data = await response.json(); // Se convierte en una respuesta a JSON
    const pokemons = data.pokemon.slice(0, 50); // Obtengo los primeros 50 Pokémon

    // Se obtienen los detalles de cada Pokémon
    const detalles = await Promise.all(
      pokemons.map(async (p) => {
        const res = await fetch(p.pokemon.url);
        return res.json();
      })
    );

    container.innerHTML = ''; // Limpio el contenedor
    detalles.forEach(pokemon => {
      container.innerHTML += crearCarta(pokemon); // Se muestra cada Pokémon
    });
  } catch (error) {
    container.innerHTML = `<p>No se encontraron Pokémon del tipo "${tipo}".</p>`; // Mensaje de error
  }
}

