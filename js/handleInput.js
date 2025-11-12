class HandleInput {
  // Inicializa os manipuladores de eventos para entrada do usuário
  constructor() {
    const fullScreenBtn = document.getElementById('fullScreenBtn');
    fullScreenBtn.addEventListener('click', (event) => HandleInput.toggleFullScreen(event));
    const pauseButton = document.querySelector('#pauseBtn');
    pauseButton.addEventListener('click', (event) => this.pause(event));
    const moveButtons = document.querySelectorAll('button');
    window.addEventListener('keydown', (event) => this.handler(event));
    window.addEventListener('keyup', (event) => this.handler(event));
    window.addEventListener('keypress', (event) => this.handler(event));
    moveButtons.forEach((button) => {
      if (button.name !== 'fullscreenbtn') {
        button.addEventListener('contextmenu', (event) => event.preventDefault());
        button.addEventListener('touchstart', (event) => this.handler(event));
        button.addEventListener('touchend', (event) => this.handler(event));
      }
    });
// inicializa o mapa de teclas e o estado das teclas pressionadas
    this.map = {};
    this.mapPress = { p: true, enter: false };
  }
// alterna o estado de pausa do jogo
  pause(e) {
    const pauseBtn = document.querySelector('#pauseBtn');
    pauseBtn.classList.toggle('off');
    if (!window.navigator.maxTouchPoints && e.type !== 'keypress') {
      this.mapPress.p = !this.mapPress.p;
    }
  }
// manipula os eventos de entrada do usuário
  /**
   *
   * @param {KeyboardEvent} event
   */
  handler(event) {
    if (event.type === 'keypress') {
      const key = event.key.toLowerCase();
      if (!event.repeat) {
        this.mapPress[key] = !this.mapPress[key];
        if (event.key === 'p') {
          this.pause(event);
        }
      }
    } else if (event.type === 'keyup' || event.type === 'keydown') {
      const key = event.key.toLowerCase();
      this.map[key] = event.type === 'keydown';
    }
    if ((event.target.name !== 'p') && (event.type === 'touchstart' || event.type === 'touchend')) {
      const key = event.target.name;
      this.map[key] = event.type === 'touchstart';
      this.mapPress[key] = event.type === 'touchend';
    }
    if (event.target.name === 'p' && event.type === 'touchend') {
      this.mapPress.p = !this.mapPress.p;
    }
  }
// verifica se uma tecla específica está pressionada
  isKeyDown(key) {
    return Boolean(this.map[key.toLowerCase()]);
  }
// alterna o modo de tela cheia
  static toggleFullScreen() {
    const gameContainer = document.querySelector('.container');
    if (!document.fullscreenElement) {
      gameContainer.requestFullscreen().catch((err) => {
        alert(`Error, can't enable full-screen ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }
}
// instancia o manipulador de entrada
export default HandleInput;
