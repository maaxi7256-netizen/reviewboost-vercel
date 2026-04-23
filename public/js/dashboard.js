const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';
const token = localStorage.getItem('reviewboost_token');
if (!token) window.location.href = '/index.html';
let currentBusiness = null;

function logout() { localStorage.removeItem('reviewboost_token'); window.location.href = '/index.html'; }

async function loadDashboard() {
  try {
    const prof = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (!prof.ok) throw new Error('Session abgelaufen');
    const profData = await prof.json();
    document.getElementById('userName').textContent = profData.user.name;

    const biz = await fetch(`${API_URL}/business/mine`, { headers: { Authorization: `Bearer ${token}` } });
    if (biz.ok) {
      currentBusiness = await biz.json();
      updateStats(currentBusiness.stats);
      updateQR(currentBusiness);
    }
  } catch (e) { if (e.message === 'Session abgelaufen') logout(); }
}

function updateStats(s) {
  document.getElementById('statScans').textContent = s.qrScans || 0;
  document.getElementById('statReviews').textContent = s.reviewsCollected || 0;
  document.getElementById('statPositive').textContent = s.positiveRedirects || 0;
  document.getElementById('statNegative').textContent = s.negativeCaught || 0;
}

function updateQR(biz) {
  if (biz.qrCode) document.getElementById('qrImage').src = biz.qrCode;
  document.getElementById('reviewLink').value = `${window.location.origin}/review.html?biz=${biz._id}`;
}

function copyLink() { const inp = document.getElementById('reviewLink'); inp.select(); document.execCommand('copy'); alert('Link kopiert!'); }
function downloadQR() { const img = document.getElementById('qrImage'); const a = document.createElement('a'); a.download = 'reviewboost-qr.png'; a.href = img.src; a.click(); }
loadDashboard();
