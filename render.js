function renderPlayer(player) {
  let html = `<strong>${player.name}</strong><div class="hand">`;

  for (let card of player.hand) {
    let text = "";
    let cls = "card";

    if (player.isSelf) {
      if (card.knownColor) {
        cls += ` ${card.color}`;
      } else {
        cls += " unknown";
      }
      text = card.knownNumber ? card.number : "?";
      if (!card.knownColor || !card.knownNumber) cls += " unknown";
    } else {
      cls += ` ${card.color}`;
      text = card.number;

      cls += card.knownNumber ? " known-number" : " unknown-number";

      cls += card.knownColor ? " known-color" : " unknown-color";
    }

    html += `<div class="${cls}">${text}</div>`;
  }

  html += `</div>`;
  return html;
}
function renderDiscard() {
    const grouped = {};
    for (let card of discardPile) {
        const key = card.color;
        if (!grouped[key])
            grouped[key] = [];
        grouped[key].push(card);
    }
    const container = document.getElementById("discard-pile");
    container.innerHTML = "";
    for (const color in grouped) {
        const stackDiv = document.createElement("div");
        stackDiv.className = "discard-stack";

        for (const card of grouped[color]) {
            const div = document.createElement("div");
            div.className = `card ${card.color}`;
            div.textContent = card.number;
            stackDiv.appendChild(div);
        }
        container.appendChild(stackDiv);
    }
}

function renderFireworks() {
    const grouped = {};
    for (let card of fireworks) {
        const key = card.color;
        if (!grouped[key] || grouped[key].number < card.number) {
            grouped[key] = card;
        }
    }
    const container = document.getElementById("fireworks");
    container.innerHTML = "";
    for (const color in grouped) {
        const card = grouped[color];
        const stackDiv = document.createElement("div");
        stackDiv.className = "fireworks-stack";

        const div = document.createElement("div");
        div.className = `card ${card.color}`;
        div.textContent = card.number;
		stackDiv.appendChild(div);

        container.appendChild(stackDiv);
    }
}

function render() {
  const playerCount = players.length;

  document.getElementById("player-top").innerHTML = "";
  document.getElementById("player-bottom").innerHTML = "";
  document.getElementById("player-left").innerHTML = "";
  document.getElementById("player-right").innerHTML = "";

  if (playerCount === 2) {
	const left = document.getElementById("player-left");
	left.style.display = "none";
	const right = document.getElementById("player-right");
	 right.style.display = "none";
    document.getElementById("player-top").innerHTML = renderPlayer(players[1]);
    document.getElementById("player-bottom").innerHTML = renderPlayer(players[0]);
  } else if (playerCount === 3) {
	const left = document.getElementById("player-left");
	left.style.display = "block";
	const right = document.getElementById("player-right");
	 right.style.display = "none";
    document.getElementById("player-top").innerHTML = renderPlayer(players[2]);
    document.getElementById("player-left").innerHTML = renderPlayer(players[1]);
    document.getElementById("player-bottom").innerHTML = renderPlayer(players[0]);
  } else if (playerCount === 4) {
	const left = document.getElementById("player-left");
	left.style.display = "block";
	const right = document.getElementById("player-right");
	 right.style.display = "block";
	document.getElementById("player-left").innerHTML = renderPlayer(players[1]);
    document.getElementById("player-top").innerHTML = renderPlayer(players[2]);
    document.getElementById("player-right").innerHTML = renderPlayer(players[3]);
    document.getElementById("player-bottom").innerHTML = renderPlayer(players[0]);
  }
    renderDiscard();
    renderFireworks();
}
