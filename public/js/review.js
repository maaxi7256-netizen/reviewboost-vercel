const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';
let selectedRating = 0;
const urlParams = new URLSearchParams(window.location.search);
const businessId = urlParams.get('biz');
if (!businessId) {
  document.querySelector('.review-card').innerHTML = '<h1>Ungültiger Link</h1><p>Bitte QR-Code erneut scannen.</p>';
}

async function loadBizName() {
  if (!businessId) return;
  try {
    const res = await fetch(`${API_URL}/business/public/${businessId}`);
    if (res.ok) { const data = await res.json(); document.getElementById('businessName').textContent = data.name; }
  } catch {}
}
loadBizName();

const stars = document.querySelectorAll('.star');
const ratingText = document.getElementById('ratingText');
const feedbackSection = document.getElementById('feedbackSection');
const submitBtn = document.getElementById('submitReview');
const ratingLabels = { 1:'Sehr unzufrieden 😞', 2:'Unzufrieden 😕', 3:'Geht so 😐', 4:'Zufrieden 🙂', 5:'Sehr zufrieden 😍' };

stars.forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.dataset.rating);
    stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.rating) <= selectedRating));
    ratingText.textContent = ratingLabels[selectedRating];
    submitBtn.disabled = false;
    feedbackSection.style.display = selectedRating <= 3 ? 'block' : 'none';
  });
});

submitBtn.addEventListener('click', async () => {
  if (!selectedRating || !businessId) return;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Wird gesendet...';
  try {
    const feedback = document.getElementById('feedbackText')?.value || '';
    const res = await fetch(`${API_URL}/reviews/${businessId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: selectedRating, feedback })
    });
    const data = await res.json();
    if (data.isPositive && data.redirect) {
      window.location.href = data.redirect;
    } else {
      document.querySelector('.review-card').innerHTML = `
        <h1>Vielen Dank für dein Feedback!</h1>
        <p>Wir nehmen deine Kritik ernst und werden uns verbessern.</p>
        <p style="margin-top:2rem; color:#6B7280">Deine Bewertung wurde nicht auf Google veröffentlicht.</p>`;
    }
  } catch {
    alert('Fehler beim Senden. Bitte versuche es später erneut.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Bewertung absenden';
  }
});
