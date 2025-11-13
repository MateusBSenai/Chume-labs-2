import {
  handleInput, formatTime, addItens, resource, tracks, canvas,
} from './util.js';
import Sprite from './sprite.js';
import rain from './animations/rain.js';
// importa a pista de corrida de ,./road.js
class Director {
  constructor() {
    this.realTime = 0;
    this.totalTime = 0;
    this.animTime = 0;
    this.timeSinceLastFrameSwap = 0;
    this.lap = 0;
    this.lastLap = 0;
    this.fastestLap = 0;
    this.totalLaptimes = [];
    this.laptimes = [];
    this.position = '';
    this.positions = [];
    this.running = true;
    this.startLights = new Sprite();
    this.paused = false;
    this.hudPositions = [];
    this.trackName = '';
    this.startTimer = 5000;
    this.carSegments = [];
    this.raining = false;
    this.rain = [];
  }
// cria os elementos iniciais da corrida
  create(road, trackName) {
    handleInput.mapPress.p = true;

    const segmentLineFirst = road.getSegmentFromIndex(0);
    const segmentLineTen = road.getSegmentFromIndex(tracks[road.trackName].trackSize - 160);
    this.trackName = trackName;
    this.startLights.offsetX = 0;
    this.startLights.offsetY = 2;
    this.startLights.scaleX = 27;
    this.startLights.scaleY = 27;
    this.startLights.spritesInX = 6;
    this.startLights.sheetPositionX = Math.ceil(this.animTime / 500);
    this.startLights.image = resource.get('startLights');
    this.startLights.name = 'tsStartLights';
    segmentLineFirst.sprites.push(this.startLights);
    segmentLineTen.sprites.push(this.startLights);
// adiciona as barras de luzes de largada
    const startLineLeft = new Sprite();
    startLineLeft.offsetX = -1.15;
    startLineLeft.scaleX = 216;
    startLineLeft.scaleY = 708;
    startLineLeft.image = resource.get('startLightsBar');
    startLineLeft.name = 'tsStartLightsBar';
// barra esquerda
    const startLineRight = new Sprite();
    startLineRight.offsetX = 1.15;
    startLineRight.scaleX = 216;
    startLineRight.scaleY = 708;
    startLineRight.image = resource.get('startLightsBar');
    startLineRight.name = 'tsStartLightsBar';
// barra direita
    segmentLineFirst.sprites.push(startLineLeft);
    segmentLineFirst.sprites.push(startLineRight);
    segmentLineTen.sprites.push(startLineLeft);
    segmentLineTen.sprites.push(startLineRight);
    const rainDrops = Math.random() * 500 + 100;
    this.rain = rain(rainDrops);
    this.raining = Math.round(Math.random() * 5) % 3 === 0;
    if (this.raining) canvas.classList.add('filter');
  }
// atualiza as posições dos carros na corrida
  refreshPositions(player, opponents) {
    let arr = [];
    const {
      name, trackPosition, raceTime, x,
    } = player;
    arr.push({
      name, pos: trackPosition, raceTime, x: Number(x.toFixed(3)),
    });
// adiciona o jogador ao array de posições dos carros
    opponents.forEach((opp) => {
      const { opponentName, sprite } = opp;
      arr.push({
        name: opponentName,
        pos: opp.trackPosition,
        raceTime: opp.raceTime,
        x: Number((sprite.offsetX * 2).toFixed(3)),
      });
    });
    arr.sort((a, b) => b.pos - a.pos);
    arr = arr.map((item, index) => ({ ...item, position: index + 1 }));
    this.positions = arr;
  }
// atualiza o estado do diretor a cada frame
  update(player, opponent) {
    this.paused = handleInput.mapPress.p;
    if (this.totalTime < this.startTimer || !this.paused) this.running = false;
    else if (this.totalTime >= this.startTimer && this.paused) this.running = true;

    this.totalTime += (1 / 60) * 1000 * this.paused;
    this.animTime += (1 / 60) * 1000 * this.paused;
    this.lastLap = this.laptimes[this.lap - 2] ? this.laptimes[this.lap - 2] : 0;
    this.fastestLap = this.laptimes.length ? Math.min.apply(null, this.laptimes) : 0;

    this.position = (this.positions.findIndex((elem) => elem.name === player.name) + 1).toString();
    if (this.position < 10) this.position = `0${this.position}`;
    let numberOfCars = this.positions.length;
    if (numberOfCars < 10) numberOfCars = `0${numberOfCars}`;

    this.refreshPositions(player, opponent);
    if (this.animTime > this.startTimer) this.startLights.sheetPositionX = 0;
    else if (this.animTime > 2000 + 2500) this.startLights.sheetPositionX = 5;
    else if (this.animTime > 2000 + 2000) this.startLights.sheetPositionX = 4;
    else if (this.animTime > 2000 + 1500) this.startLights.sheetPositionX = 3;
    else if (this.animTime > 2000 + 1000) this.startLights.sheetPositionX = 2;
    else if (this.animTime > 2000 + 500) this.startLights.sheetPositionX = 1;
// atualiza o HUD com as posições dos carros
    if (this.paused) {
      const actualPos = Number(this.position);
      this.hudPositions = this.positions.filter((_, index) => {
        if (actualPos <= 2) return index <= 2 && index >= 0;
        if (actualPos === this.positions.length) return index === 0 || index >= actualPos - 2;
        return (index === 0) || (index >= actualPos - 2 && index <= actualPos - 1);
      }).map((item, index, array) => {
        const result = {
          pos: item.position, name: item.name, lap: item.raceTime.length, relTime: '- Líder', totalTime: (Math.round(item.raceTime.at(-1)) / 1000).toFixed(3),
        };
        const actualItem = item.raceTime.at(-1);
        const actualLap = item.raceTime.length;

        if (index) {
          const prevItem = array[index - 1].raceTime.at(-1) || 0;
          const prevLap = array[index - 1].raceTime.length || 0;
          if (actualLap === prevLap) {
            result.relTime = `+ ${(Math.round(actualItem - prevItem) / 1000).toFixed(3)}`;
          } else if (actualLap !== prevLap) {
            result.relTime = `- ${prevLap - actualLap} Lap`;
          }
        }
        return result;
      });
// atualiza as posições dos carros na pista
      this.carSegments = this.positions.map((driver) => ({
        name: driver.name,
        pos: Math.floor(driver.pos / 200) % tracks[this.trackName].trackSize,
        x: driver.x,
      })).sort((a, b) => a.pos - b.pos);

      if (this.raining) this.rain.forEach((item) => item.update());
    }
  }
// renderiza o HUD e os efeitos climáticos
  render(render, player) {
    if (!this.paused) {
      render.drawText('#FFFAF4', 'Jogo pausado!', 320, 175,
        2, 'OutriderCond', 'center', 'black', true);
    }
    if (!this.paused) {
      render.drawText('#FFFAF4', 'Aperte "P" para continuar', 320, 215,
        2, 'OutriderCond', 'center', 'black', true);
    }
    if (this.totalTime < 2500) {
      render.drawText('#FFFAF4', 'Prepare-se...', 320, 135,
        2, 'OutriderCond', 'center', 'black', true);
    }
    // renderiza as informações da volta
    render.drawText('#050B1A', `Volta ${this.lap} de ${tracks[this.trackName].laps}`, 4, 44, 0.8, 'Computo', 'left');
    this.hudPositions.forEach(({ pos, name, relTime }, index) => {
      const alignPos = pos < 10 ? `0${pos}` : pos;
      render.drawText('#050B1A', `${alignPos}`, 4, `${60 + (index * 16)}`, 0.8, 'Computo', 'left');
      render.drawText('#050B1A', `${name} ${relTime}`, 32, `${60 + (index * 16)}`, 0.8, 'Computo', 'left');
    });
    render.drawText('#050B1A', `Total: ${formatTime(this.totalTime)}`, 636, 44, 0.8, 'Computo', 'right');
    render.drawText('#050B1A', `Lap: ${formatTime(this.animTime)}`, 636, 60, 0.8, 'Computo', 'right');
    render.drawText('#050B1A', `Last: ${formatTime(this.lastLap)}`, 636, 76, 0.8, 'Computo', 'right');
    render.drawText('#050B1A', `Fast: ${formatTime(this.fastestLap)}`, 636, 92, 0.8, 'Computo', 'right');

    if (this.raining) this.rain.forEach((item) => item.render(render, player));
    // renderiza os efeitos de chuva
  }
}

export default Director;

// --- Tela de fim de corrida com PÓDIO e posição do jogador (identificação confiável) ---
Director.prototype.checkRaceEnd = function(player) {
  const totalLaps = tracks[this.trackName].laps;

  // só termina quando COMPLETA todas as voltas (não antes)
  if (this.lap > totalLaps && !this.ended) {
    this.ended = true; // trava pra não chamar várias vezes

    // pausa corretamente
    this.running = false;
    this.paused = true;

    // cria a tela final
    const endScreen = document.createElement('div');
    endScreen.id = 'endScreen';
    Object.assign(endScreen.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'OutriderCond, sans-serif',
      fontSize: '1.6rem',
      textAlign: 'center',
      zIndex: '9999',
      opacity: '0',
      transition: 'opacity 0.6s ease'
    });

    const title = document.createElement('h1');
    title.textContent = '🏁 Corrida Finalizada!';
    title.style.marginBottom = '20px';
    endScreen.appendChild(title);

    const info = document.createElement('div');
    const bestLap = this.totalLaptimes.length
      ? Math.min(...this.totalLaptimes)
      : this.animTime;
    const total = this.totalLaptimes.reduce((a, b) => a + b, 0);

    info.innerHTML = `
      <p><strong>Pista:</strong> ${this.trackName}</p>
      <p><strong>Voltas Completadas:</strong> ${totalLaps}</p>
      <p><strong>Melhor Volta:</strong> ${formatTime(bestLap)}</p>
      <p><strong>Tempo Total:</strong> ${formatTime(total)}</p>
    `;
    info.style.marginBottom = '30px';
    endScreen.appendChild(info);

    // === Pódio ===
    const podiumTitle = document.createElement('h2');
    podiumTitle.textContent = '🏆 Pódio 🏆';
    podiumTitle.style.marginBottom = '10px';
    endScreen.appendChild(podiumTitle);

    const podium = document.createElement('div');
    Object.assign(podium.style, {
      display: 'flex',
      gap: '30px',
      justifyContent: 'center',
      alignItems: 'flex-end',
      marginBottom: '20px'
    });

    // organiza as posições finais (menor position -> melhor)
    const finalRanking = [...this.positions].sort((a, b) => a.position - b.position);
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32']; // ouro, prata, bronze

    for (let i = 0; i < 3 && i < finalRanking.length; i++) {
      const driver = finalRanking[i];
      const block = document.createElement('div');
      Object.assign(block.style, {
        background: colors[i],
        color: '#000',
        width: '100px',
        height: `${140 - i * 30}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderRadius: '8px 8px 0 0',
        paddingBottom: '10px',
        fontWeight: 'bold',
        boxShadow: '0 0 10px rgba(255,255,255,0.4)'
      });

      block.innerHTML = `
        <span style="font-size:1.2rem;">${i + 1}º</span>
        <span style="font-size:1rem;">${driver.name}</span>
      `;
      podium.appendChild(block);
    }

    endScreen.appendChild(podium);

    // === Determinar posição do jogador de forma confiável ===
    // usa player.name passado pelo loop para encontrar a entrada correta em this.positions
    let playerName = (player && player.name) ? player.name : null;

    // fallbacks:
    // 1) se playerName não existir, tenta pegar o primeiro elemento de positions
    if (!playerName) playerName = this.positions[0]?.name || 'Você';

    // 2) procura no ranking final pelo nome exato (case-sensitive). Se não encontrar, tenta case-insensitive.
    let playerRankIndex = finalRanking.findIndex(p => p.name === playerName);
    if (playerRankIndex === -1) {
      playerRankIndex = finalRanking.findIndex(p => p.name && p.name.toLowerCase() === String(playerName).toLowerCase());
    }

    // 3) se ainda não encontrou, tenta identificar por semelhança (último recurso)
    if (playerRankIndex === -1) {
      // como fallback, suponha que o jogador seja a entrada com o menor raceTime (ou a primeira do array)
      playerRankIndex = finalRanking.findIndex(p => p.isPlayer) ; // se você tiver isPlayer algum dia
      if (playerRankIndex === -1) playerRankIndex = finalRanking.findIndex(p => p.name && p.name.toLowerCase().includes('player'));
      if (playerRankIndex === -1) playerRankIndex = 0; // evita -1: assume primeiro
    }

    const playerRank = playerRankIndex + 1; // 1-based

    const playerResult = document.createElement('p');
    playerResult.innerHTML = `🏎️ Você terminou em <strong>${playerRank}º lugar</strong>!`;
    playerResult.style.marginTop = '10px';
    playerResult.style.fontSize = '1.5rem';
    // cor por posição (1->gold,2->silver,3->bronze, else white)
    if (playerRank === 1) playerResult.style.color = '#FFD700';
    else if (playerRank === 2) playerResult.style.color = '#C0C0C0';
    else if (playerRank === 3) playerResult.style.color = '#CD7F32';
    else playerResult.style.color = '#00ffcc';
    playerResult.style.textShadow = '0 0 10px rgba(0,255,255,0.08)';
    endScreen.appendChild(playerResult);

    // OPTIONAL DEBUG: descomente para ver estrutura de positions e playerName no console
    // console.log('FINAL RANKING:', finalRanking);
    // console.log('playerName used to match:', playerName);
    // console.log('playerRankIndex:', playerRankIndex);

    // adiciona tudo na tela
    document.body.appendChild(endScreen);

    // transição suave de aparição
    requestAnimationFrame(() => {
      endScreen.style.opacity = '1';
    });
  }
};

// --- Intercepta o update do diretor sem travar o jogo ---
// substitute originalUpdate wrapper so we can pass the player object to checkRaceEnd
const originalUpdate = Director.prototype.update;
Director.prototype.update = function(player, opponent) {
  if (!this.ended) {
    originalUpdate.call(this, player, opponent);
    // passa o objeto player para a checagem para identificação correta
    this.checkRaceEnd(player);
  }
};

