const wikiDesc = document.getElementById('description');
const titleEl = document.getElementById('title');
const cover = document.getElementById('cover');
const torrentsList = document.getElementById('torrents-list');
const officialLink = document.getElementById('official-link');

const PIRATE_API = 'https://apibay.org/q.php?q=';

async function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function fetchWikipedia(name) {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.extract || 'No description found.';
  } catch {
    return 'No description available.';
  }
}

async function fetchPirates(name) {
  try {
    const res = await fetch(`${PIRATE_API}${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    console.error('PirateBay API error');
    return [];
  }
}

function makeMagnet(hash, name) {
  return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(name)}`;
}

async function loadGame() {
  const name = await getParam('name');
  if (!name) {
    document.getElementById('game-container').innerHTML = '<h2>No game specified.</h2>';
    return;
  }
  titleEl.textContent = name;
  document.title = `K‑Game‑Store – ${name}`;

  // show cover later
  cover.src = `https://via.placeholder.com/400x225?text=${encodeURIComponent(name)}`;

  wikiDesc.textContent = 'Loading description…';
  wikiDesc.textContent = await fetchWikipedia(name);

  torrentsList.innerHTML = '<li>Loading torrents…</li>';
  const results = await fetchPirates(name);
  torrentsList.innerHTML = '';
  if (!results.length) {
    torrentsList.innerHTML = '<li>No torrents found.</li>';
    return;
  }
  results.forEach(t => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${t.name}</strong> — Seeders: ${t.seeders}, Leechers: ${t.leechers}<br>
      <a href="${makeMagnet(t.info_hash, t.name)}" target="_blank">Download Magnet Link</a>
    `;
    torrentsList.appendChild(li);
  });
}

loadGame();
