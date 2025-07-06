const grid = document.getElementById("cells");
const select = document.getElementById("dificultad-select");
const iniciar = document.getElementById("iniciar-juego");

let numFilas = 20;
let numColumnas = 40;
let tablero = [];

iniciar.addEventListener("click", () => {
  grid.innerHTML = "";
  tablero = [];

  const dificultad = select.value;
  if (dificultad === "easy") {
    numFilas = 10;
    numColumnas = 10;
  } else if (dificultad === "medium") {
    numFilas = 20;
    numColumnas = 40;
  } else if (dificultad === "hard") {
    numFilas = 30;
    numColumnas = 60;
  }

  grid.style.gridTemplateColumns = `repeat(${numColumnas}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${numFilas}, 1fr)`;

  iniciarJuego();
});

function iniciarJuego() {
  // Lógica del tablero
  for (let f = 0; f < numFilas; f++) {
    const fila = [];
    for (let c = 0; c < numColumnas; c++) {
      fila.push({
        esBomba: false,
        revelada: false,
        bombasCerca: 0,
      });
    }
    tablero.push(fila);
  }

  // Creando celdas
  casillasTablero(numFilas, numColumnas);

  // Colocando las minas
  const totalCeldas = numFilas * numColumnas;
  const minas = Math.floor(totalCeldas * 0.15); // 15%
  addMinas(minas);

  //AgAsignando eventos 
  for (let f = 0; f < numFilas; f++) {
    for (let c = 0; c < numColumnas; c++) {
      const div = document.getElementById(`cell-${f}-${c}`);
      div.addEventListener("click", () => {
        revelarCelda(f, c);
      });
    }
  }
}

function casillasTablero(numFilas, numColumnas) {
  for (let f = 0; f < numFilas; f++) {
    for (let c = 0; c < numColumnas; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `cell-${f}-${c}`;
      grid.appendChild(cell);
    }
  }
}

function addMinas(numMinas) {
  const colocadas = new Set();

  while (colocadas.size < numMinas) {
    const f = Math.floor(Math.random() * numFilas);
    const c = Math.floor(Math.random() * numColumnas);

    if (!tablero[f][c].esBomba) {
      tablero[f][c].esBomba = true;
      colocadas.add(`${f}-${c}`);

      // Aumenta bombasCerca a vecinos
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const nf = f + i;
          const nc = c + j;
          if (
            nf >= 0 && nf < numFilas &&
            nc >= 0 && nc < numColumnas &&
            !(i === 0 && j === 0)
          ) {
            tablero[nf][nc].bombasCerca++;
          }
        }
      }
    }
  }
}

function revelarCelda(f, c) {
  const celda = tablero[f][c];
  if (!celda || celda.revelada) return;

  celda.revelada = true;
  const div = document.getElementById(`cell-${f}-${c}`);
  div.classList.add("revelada");

  if (celda.esBomba) {
    div.classList.add("bomba");
    div.textContent = "💣";
    alert("¡BOOM! Has perdido.");
    return;
  }

  if (celda.bombasCerca > 0) {
    div.textContent = celda.bombasCerca;
    return;
  }

  // Expansión 3x3 
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const nf = f + i;
      const nc = c + j;
      if (
        nf >= 0 && nf < numFilas &&
        nc >= 0 && nc < numColumnas &&
        !(i === 0 && j === 0)
      ) {
        const vecino = tablero[nf][nc];
        const divVecino = document.getElementById(`cell-${nf}-${nc}`);
        if (!vecino.revelada && !vecino.esBomba) {
          vecino.revelada = true;
          divVecino.classList.add("revelada");
          if (vecino.bombasCerca > 0) {
            divVecino.textContent = vecino.bombasCerca;
          }
        }
      }
    }
  }
}
