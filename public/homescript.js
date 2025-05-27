document.getElementById('logout').addEventListener("click",()=>{
    window.location.href = '/logout';
})

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const animeCards = document.querySelectorAll('.anime-card');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.toLowerCase();

    animeCards.forEach(card => {
      const name = card.querySelector('.anime-name').textContent.toLowerCase();
      const genre = card.querySelector('.anime-genre').textContent.toLowerCase();

      if (name.includes(query) || genre.includes(query)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
});
