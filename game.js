const wikiDesc = document.getElementById('description');
const gameTitleEl = document.getElementById('title');
const coverImg = document.getElementById('cover');
const torrentsList = document.getElementById('torrents-list');
const officialLink = document.getElementById('official-link');

const RAWG_API = 'https://api.rawg.io/api/games';
const PIRATEBAY_API = 'https://apibay.org/q.php?q=';

async function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

async function fetchGameDetails(name) {
  try {
    const res = await fetch(`${RAWG_API}?search=${encodeURIComponent(name)}&page_size=1`);
    const data = await res.json();
    if (data.results.length === 0) return null;
    return data.results[0];
  } catch (e) {
    console.error('RAWG API fetch failed:', e);
    return null;
  }
}

async function fetchWikipediaDesc(name) {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error('Wiki no content');
    const data = await res.json();
    return data.extract || 'No description available.';
  } catch {
    return 'No description available.';
  }
}

async function fetchPirateBayTorrents(name) {
  try {
    const res = await fetch(`${PIRATEBAY_API}${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error('Failed PirateBay API');
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('PirateBay API error:', e);
    return [];
  }
}

function createMagnetLink(info_hash, name) {
  return `magnet:?xt=urn:btih:${info_hash}&dn=${encodeURIComponent(name)}`;
}

async function loadGame() {
  const gameName = await getQueryParam('name');
  if (!gameName) {
    document.getElementById('game-container').innerHTML = '<h2>No game specified.</h2>';
    return;
  }

  gameTitleEl.textContent = gameName;
  document.title = `K-Game-Store - ${gameName}`;

  // Fetch game details from RAWG
  const gameDetails = await fetchGameDetails(gameName);
  if (gameDetails && gameDetails.background_image) {
    coverImg.src = gameDetails.background_image;
  } else {
    coverImg.src = 'https://via.placeholder.com/400x225?text=No+Image';
  }

  if (gameDetails && gameDetails.website) {
    officialLink.href = gameDetails.website;
  } else {
    officialLink.href = '#';
  }

  // Fetch Wikipedia description
  wikiDesc.textContent = 'Loading description...';
  const desc = await fetchWikipediaDesc(gameName);
  wikiDesc.textContent = desc;

  // Fetch PirateBay torrents
  torrentsList.innerHTML = '<li>Loading torrents...</li>';
  const torrents = await fetchPirateBayTorrents(gameName);

  if (!torrents || torrents.length === 0) {
    torrentsList.innerHTML = '<li>No torrents found.</li>';
    return;
  }

  torrentsList.innerHTML = '';
  torrents.forEach(t => {
    const li = document.createElement('li');
    const magnet = createMagnetLink(t.info_hash, t.name);

    li.innerHTML = `
      <strong>${t.name}</strong> — Seeders: ${t.seeders}, Leechers: ${t.leechers} <br />
      <a href="${magnet}" target="_blank" rel="noopener noreferrer">Download Magnet Link</a>
    `;
    torrentsList.appendChild(li);
  });
}

// Run on page load
loadGame();
