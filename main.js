function startGame() {
  const btn = document.getElementById('submitBtn');
  if (btn) {
    btn.onclick = () => {
      const inputValue = document.getElementById('inputValue').value.trim();
      if (inputValue) {
        window.location.href = `first/${inputValue}.html`;
      }
    };
  }
}

window.onload = () => {
  startGame();
};