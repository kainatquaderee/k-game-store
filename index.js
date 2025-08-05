const gameGrid = document.getElementById('game-grid');
const searchInput = document.getElementById('search');

// RAWG API base
const RAWG_API = 'https://api.rawg.io/api/games';
// **You can get a free key from RAWG.io and append &key=YOUR_KEY to improve rate limits**
// But it's optional for small demo

// Fetch popular games on load
async function loadPopularGames() {
  try {
    const res = await fetch(`${RAWG_API}?page_size=20&ordering=-rating`);
    const data = await res.json();

    renderGames(data.results);
  } catch (e) {
    console.error('Failed to fetch popular games:', e);
    gameGrid.innerHTML = '<p>Failed to load games. Try refreshing.</p>';
  }
}

function renderGames(games) {
  gameGrid.innerHTML = '';
  if (!games.length) {
    gameGrid.innerHTML = '<p>No games found.</p>';
    return;
  }

  games.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <img src="${game.background_image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${game.name}" />
      <h3>${game.name}</h3>
    `;

    card.onclick = () => {
      // Open game page with name query param
      window.location.href = `game.html?name=${encodeURIComponent(game.name)}`;
    };

    gameGrid.appendChild(card);
  });
}

async function searchGames(term) {
  if (!term) {
    return loadPopularGames();
  }
  try {
    const res = await fetch(`${RAWG_API}?search=${encodeURIComponent(term)}&page_size=20`);
    const data = await res.json();
    renderGames(data.results);
  } catch (e) {
    console.error('Failed to search games:', e);
    gameGrid.innerHTML = '<p>Error searching games.</p>';
  }
}

searchInput.addEventListener('input', e => {
  const term = e.target.value.trim();
  searchGames(term);
});

// Initial load
loadPopularGames();
