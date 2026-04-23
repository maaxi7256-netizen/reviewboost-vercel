/* === API URL AUTO-DETECT === */
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';

/* === TOKEN HELPER === */
const setToken = (t) => localStorage.setItem('reviewboost_token', t);
const getToken = () => localStorage.getItem('reviewboost_token');
const removeToken = () => localStorage.removeItem('reviewboost_token');
if (getToken() && window.location.pathname === '/') window.location.href = '/dashboard.html';

/* === TAB SWITCHER === */
const tabRegister = document.getElementById('tabRegister');
const tabLogin = document.getElementById('tabLogin');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const switchToLogin = document.getElementById('switchToLogin');
const switchToRegisterP = document.getElementById('switchToRegister');

tabRegister?.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    switchToLogin.style.display = '';
    switchToRegisterP.style.display = 'none';
});
tabLogin?.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    switchToLogin.style.display = 'none';
    switchToRegisterP.style.display = '';
});
switchToLogin?.addEventListener('click', (e) => {
    e.preventDefault();
    tabLogin.click();
});

/* === REGISTRIERUNG === */
registerForm?.addEventListener('submit', async (e) => {
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
        if (res.ok) {
            setToken(data.token);
            window.location.href = '/dashboard.html';
        } else {
            alert('Fehler: ' + data.message);
        }
    } catch (err) {
        alert('Server nicht erreichbar. Bist du online?');
    }
});

/* === LOGIN === */
loginForm?.addEventListener('submit', async (e) => {
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
        if (res.ok) {
            setToken(data.token);
            window.location.href = '/dashboard.html';
        } else {
            alert('Fehler: ' + data.message);
        }
    } catch (err) {
        alert('Server nicht erreichbar. Bist du online?');
    }
});
