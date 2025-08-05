const grid = document.getElementById('game-grid');
const searchInput = document.getElementById('search');
const API = 'https://www.freetogame.com/api/games';

function renderGames(list) {
  grid.innerHTML = '';
  list.forEach(g => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <img src="${g.thumbnail}" alt="${g.title}">
      <h3>${g.title}</h3>`;
    card.onclick = () => {
      location.href = `game.html?name=${encodeURIComponent(g.title)}`;
    };
    grid.appendChild(card);
  });
}

async function loadList() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    renderGames(data);
  } catch (e) {
    console.error(e);
    grid.innerHTML = '<p>Unable to load games. Please refresh.</p>';
  }
}

searchInput.addEventListener('input', e => {
  const term = e.target.value.toLowerCase();
  Array.from(document.querySelectorAll('.game-card')).forEach(c => {
    c.style.display = c.querySelector('h3').textContent.toLowerCase().includes(term) ? '' : 'none';
  });
});

loadList();
