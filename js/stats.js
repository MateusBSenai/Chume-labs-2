(function (global, factory) { // UMD wrapper
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory()
    : typeof define === 'function' && define.amd ? define(factory)
      : (global.Stats = factory());
}(this, (() => {
  /**
 * @author mrdoob / http://mrdoob.com/
 */
// classe Stats para monitoramento de desempenho
  const Stats = function () {
    let mode = 0;
// cria o contêiner principal para os painéis de estatísticas
    const container = document.createElement('div');
    container.classList.add('fpsCanvas');
    container.classList.add('hidden');
// função para exibir um painel específico
    function showPanel(id) {
      for (let i = 0; i < container.children.length; i += 1) {
        container.children[i].style.display = i === id ? 'inline-block' : 'none';
      }
      mode = id;
    }
// adiciona um evento de clique ao contêiner para alternar entre os painéis
    container.addEventListener('click', (event) => {
      event.preventDefault();
      showPanel((mode + 1) % container.children.length);
    }, false);
// função para adicionar um novo painel ao contêiner
    function addPanel(panel) {
      container.appendChild(panel.dom);
      return panel;
    }
// variáveis para rastrear o tempo e os quadros por segundo
    let beginTime = (performance || Date).now(); let prevTime = beginTime; let
      frames = 0;

    const fpsPanel = addPanel(new Stats.Panel('FPS', '#0ff', '#002'));
    const msPanel = addPanel(new Stats.Panel('MS', '#0f0', '#020'));
// adiciona um painel de memória se suportado pelo navegador
    if (self.performance && self.performance.memory) {
      var memPanel = addPanel(new Stats.Panel('MB', '#f08', '#201'));
    }
// exibe o painel FPS por padrão
    showPanel(0);
// retorna o objeto Stats com métodos para monitoramento
    return {
// versão do Stats
      REVISION: 16,

      dom: container,
// método para adicionar um painel
      addPanel,
      showPanel,
// inicia a medição de tempo
      begin() {
        beginTime = (performance || Date).now();
      },
// finaliza a medição de tempo e atualiza os painéis
      end() {
        frames++;

        const time = (performance || Date).now();

        msPanel.update(time - beginTime, 200);

        if (time >= prevTime + 1000) {
          fpsPanel.update((frames * 1000) / (time - prevTime), 100);

          prevTime = time;
          frames = 0;

          if (memPanel) {
            const { memory } = performance;
            memPanel.update(memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576);
          }
        }

        return time;
      },
// atualiza os painéis sem iniciar uma nova medição
      update() {
        beginTime = this.end();
      },

      // Backwards Compatibility

      domElement: container,
      setMode: showPanel,

    };
  };
// definição do painel de estatísticas
  Stats.Panel = function (name, fg, bg) {
    let min = Infinity; let max = 0; const
      { round } = Math;
    const PR = round(window.devicePixelRatio || 1);
// dimensões do painel
    const WIDTH = 80 * PR; const HEIGHT = 48 * PR;
    const TEXT_X = 3 * PR; const TEXT_Y = 2 * PR;
    const GRAPH_X = 3 * PR; const GRAPH_Y = 15 * PR;
    const GRAPH_WIDTH = 74 * PR; const
      GRAPH_HEIGHT = 30 * PR;
// cria o canvas para o painel
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
// obtém o contexto de renderização do canvas
    const context = canvas.getContext('2d');
    context.font = `${10 * PR}px Computo`;
    context.textBaseline = 'top';
// inicializa o painel com o nome e as cores fornecidas
    context.fillStyle = bg;
    context.fillRect(0, 0, WIDTH, HEIGHT);
// desenha o texto do painel
    context.fillStyle = fg;
    context.fillText(name, TEXT_X, TEXT_Y);
    context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
// inicializa o gráfico do painel
    context.fillStyle = bg;
    context.globalAlpha = 0.9;
    context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
// retorna o objeto do painel com o método de atualização
    return {

      dom: canvas,

      update(value, maxValue) {
        min = Math.min(min, value);
        max = Math.max(max, value);

        context.fillStyle = bg;
        context.globalAlpha = 1;
        context.fillRect(0, 0, WIDTH, GRAPH_Y);
        context.fillStyle = fg;
        context.fillText(`${round(value)}(${round(min)}-${round(max)})`, TEXT_X, TEXT_Y);

        context.drawImage(canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT);

        context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);

        context.fillStyle = bg;
        context.globalAlpha = 0.9;
        context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round((1 - (value / maxValue)) * GRAPH_HEIGHT));
      },

    };
  };
// exporta a classe Stats para uso em outros módulos
  return Stats;
})));
