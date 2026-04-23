const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';
function setToken(t) { localStorage.setItem('reviewboost_token', t); }
function getToken() { return localStorage.getItem('reviewboost_token'); }
function removeToken() { localStorage.removeItem('reviewboost_token'); }
function isLoggedIn() { return !!getToken(); }
if (isLoggedIn() && window.location.pathname === '/') window.location.href = '/dashboard.html';

function showRegister() { document.getElementById('registerModal').style.display = 'block'; }
function hideRegister() { document.getElementById('registerModal').style.display = 'none'; }
function showLogin() { document.getElementById('loginModal').style.display = 'block'; }
function hideLogin() { document.getElementById('loginModal').style.display = 'none'; }

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok) { setToken(data.token); window.location.href = '/dashboard.html'; }
    else alert(data.message);
  } catch { alert('Verbindungsfehler.'); }
});

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) { setToken(data.token); window.location.href = '/dashboard.html'; }
    else alert(data.message);
  } catch { alert('Verbindungsfehler.'); }
});
