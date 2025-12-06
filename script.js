const btnIniciar = document.getElementById('btnIniciar');
const btnIniciarJogo = document.getElementById('bntIniciarJogo');
const telaInicial = document.getElementById('tela-inicial');
const telaJogo = document.getElementById('tela-jogo');
const board = document.getElementById('board');
const btnVoltar = document.getElementById('btnVoltar');
const levelDisplay = document.getElementById('level-display');

// --- IMPLEMENTAÇÃO DOS SONS ---
// Garanta que você tenha a pasta /sons com os arquivos .mp3
const somAcerto = new Audio('sons/acerto.mp3');
const somErro = new Audio('sons/erro.mp3');
const somVitoria = new Audio('sons/vitoria.mp3');
const somFlip = new Audio('sons/flip.mp3'); // Som para virar a carta

const INITIAL_PAIRS = 4;
const PAIRS_INCREASE = 4; 
const FINAL_LEVEL = 3;
let currentLevel = 1;
let currentPairs = INITIAL_PAIRS;
let currentColumns = 4; 
let firstCard = null;
let secondCard = null;
let lock = false;

let attempts = 0; 
let totalErrors = 0; 
let rankingData = [];

function loadRanking() {
    const storedRanking = localStorage.getItem('memoryRankingGlobal'); 
    if (storedRanking) {
        rankingData = JSON.parse(storedRanking);
    }
}

function saveRanking() {
    localStorage.setItem('memoryRankingGlobal', JSON.stringify(rankingData));
}

function registerScore(finalErrors) {
    const playerName = prompt(`🏆 FIM DE JOGO! Pontuação Total em ${FINAL_LEVEL} Níveis: ${finalErrors} Erros. Digite seu nome para o Ranking:`);

    if (!playerName) return;

    const newEntry = {
        nome: playerName,
        erros: finalErrors
    };

    rankingData.push(newEntry);
    saveRanking();
    
    displayRanking(); 
}

function displayRanking() {
    loadRanking(); 

    const rankingList = document.getElementById('ranking-list');
    if (!rankingList) return;
    
    const sortedRanking = rankingData
        .sort((a, b) => a.erros - b.erros)
        .slice(0, 10); 

    rankingList.innerHTML = ''; 

    if (sortedRanking.length === 0) {
        rankingList.innerHTML = '<li>Nenhuma pontuação global registrada ainda.</li>';
        return;
    }

    sortedRanking.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `#${index + 1} ${entry.nome} - Total: ${entry.erros} erros`;
        rankingList.appendChild(li);
    });
}

btnIniciar.addEventListener('click', () => {
    telaInicial.classList.remove("show");
    telaInicial.classList.add("hide");
    setTimeout(() => {
        telaJogo.classList.remove("hide");
        telaJogo.classList.add("show");
        
        resetGameProgress(); 
        startGame(); 
    }, 300);
});

btnIniciarJogo.addEventListener('click', () => {
    telaInicial.classList.remove("show");
    telaInicial.classList.add("hide");
    setTimeout(() => {
        telaJogo.classList.remove("hide");
        telaJogo.classList.add("show");
        
        resetGameProgress(); 
        startGame(); 
    }, 300);
});

btnVoltar.addEventListener("click", () => {
    telaJogo.classList.remove("show");
    telaJogo.classList.add("hide");
    setTimeout(() => {
        telaInicial.classList.remove("hide");
        telaInicial.classList.add("show");
        
        resetGameProgress();  
        displayRanking(); 
    }, 300);
});

function resetGameProgress() {
    currentLevel = 1;
    currentPairs = INITIAL_PAIRS;
    currentColumns = 4;
    board.innerHTML = ''; 
    totalErrors = 0; 
    
    if (levelDisplay) { 
        levelDisplay.textContent = `Nível: ${currentLevel} (${currentPairs} Pares)`;
    }
}

function startGame() {
  if (levelDisplay) {
      let levelName = '';
      if (currentLevel === 1) levelName = 'Fácil';
      else if (currentLevel === 2) levelName = 'Médio';
      else if (currentLevel === 3) levelName = 'Difícil';

      levelDisplay.textContent = `Nível: ${currentLevel} (${levelName} - ${currentPairs} Pares)`;
  }
  
  attempts = 0; 
  
  if (currentPairs === 12) {
      currentColumns = 6; 
  } else if (currentPairs === 8) {
      currentColumns = 4; 
  } else { 
      currentColumns = 4; 
  }

  board.style.gridTemplateColumns = `repeat(${currentColumns}, 1fr)`;
  createCards(currentPairs);
};

function createCards(pairs) {
    const images = [];
    
    const maxImages = 20; 
    for (let i = 1; i <= Math.min(pairs, maxImages); i++) images.push(`imagens/image${i}.png`);

    const allImages = [...images, ...images].sort(() => Math.random() - 0.5);
    board.innerHTML = '';

    allImages.forEach(img => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
          <div class="inner">
            <div class="face back">?</div>
            <div class="face front" style="background-image: url('${img}');"></div>
          </div>
        `;
        card.addEventListener('click', () => flipCard(card, img));
        board.appendChild(card);
    });
}

function flipCard(card, image) {
    if (lock || card.classList.contains('flipped') || card.classList.contains('is-matched')) return; 
    
    // Toca o som de virar a carta
    somFlip.currentTime = 0; // Permite que o som toque mesmo em cliques rápidos
    somFlip.play();
    
    card.classList.add('flipped');

    if (!firstCard) firstCard = { card, image };
    else {
        secondCard = { card, image };
        lock = true;
        attempts++; 
        checkMatch();
    }
}

function checkMatch() {
    if (firstCard.image === secondCard.image) {
        // Toca o som de acerto
       

        firstCard.card.classList.add('is-matched');
        secondCard.card.classList.add('is-matched');
        checkWin();
        setTimeout(() => {
            somAcerto.play();    
            resetTurn();    
        }, 500)

    } else {
        // Toca o som de erro
        

        setTimeout(() => {
            firstCard.card.classList.remove('flipped');
            secondCard.card.classList.remove('flipped');
            resetTurn();
        }, 900)
        setTimeout(() => {
            somErro.play();    
            resetTurn();
        }, 900)
    }
}

function resetTurn() {
    [firstCard, secondCard, lock] = [null, null, false];
}

function checkWin() {
    const totalCards = document.querySelectorAll('.card').length;
    const matchedCards = document.querySelectorAll('.card.is-matched').length;
    
    if (matchedCards === totalCards) {
        // Toca o som de vitória ao completar o nível
        setTimeout(() => {
            somVitoria.play();    
            resetTurn();    
        }, 200)       
      
        setTimeout(() => {
            const errorsInLevel = attempts - currentPairs;
            totalErrors += errorsInLevel;
            
            if (currentLevel === FINAL_LEVEL) {
                alert(`🎉 Jogo Concluído! Total de Erros (3 Níveis): ${totalErrors}.`);
                registerScore(totalErrors); 
                btnVoltar.click(); 
            } else {
                somVitoria.play();
                alert(`🎉 Nível ${currentLevel} Concluído! Erros neste nível: ${errorsInLevel}. Total acumulado: ${totalErrors} erros.`);
                nextLevel(); 
            }  
                     
        }, 1200); // Aumentei um pouco o tempo para o som tocar antes do alerta
    }
}

function nextLevel() {
    currentLevel++;
    
    if (currentLevel === 2) {
        currentPairs = INITIAL_PAIRS + PAIRS_INCREASE;
    } else if (currentLevel === 3) {
        currentPairs = INITIAL_PAIRS + PAIRS_INCREASE * 2;
    }
    
    startGame();
}

window.onload = displayRanking;