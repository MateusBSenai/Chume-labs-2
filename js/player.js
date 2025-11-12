import Sprite from './sprite.js';
import {
  handleInput, overlap, calcCrashSpeed, resource, startPosition, tracks,
} from './util.js';
// classe para representar o jogador
class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.maxRange = 4;
    this.animationUpdateTime = 3 / 60;
    this.curvePower = 0;
    this.centrifugalForce = 0;
    this.maxSpeed = 1200;
    this.runningPower = 0;
    this.startPress = 0;
    this.sprite = new Sprite();
    this.trackPosition = 0;
    this.name = 'Player X';
    this.lap = 0;
    this.raceTime = [0];
    this.crashXCorrection = 0;
    this.cursor = 0;
  }
// obtém a largura do sprite do jogador
  get width() {
    return this.sprite.width;
  }
// obtém a altura do sprite do jogador
  get height() {
    return this.sprite.height;
  }
// move o jogador para a esquerda
  changeXToLeft(curvePower) {
    this.x = this.x <= -this.maxRange
      ? this.x = -this.maxRange
      : this.x -= curvePower;
  }
// move o jogador para a direita
  changeXToRight(curvePower) {
    this.x = this.x >= this.maxRange
      ? this.x = this.maxRange
      : this.x += curvePower;
  }
// cria o jogador com base nas opções do menu e no tamanho da pista
  create(menu, trackSize) {
    this.sprite.image = resource.get('playerRight');
    this.sprite.name = 'Player';
    this.sprite.spritesInX = 6;
    this.sprite.spritesInY = 2;
    this.sprite.sheetPositionY = 1;
    this.sprite.scaleX = 2.5;
    this.sprite.scaleY = 3;
// define a posição inicial do jogador com base na posição de qualificação
    const qualyPos = Number(menu.selectedOptions[1]) + 1;
    this.trackPosition = startPosition(trackSize, qualyPos);
    this.runningPower = 0;
  }
// reforça a curva em baixas velocidades
  reforceCurvePowerLowSpeed() {
    if (this.runningPower < 300) return 2;
    return 1;
  }
// gerador para corrigir a posição X do carro após uma batida
  * carXCrashState() {
    while (this.crashXCorrection) {
      this.crashXCorrection = this.crashXCorrection > 0 ? this.crashXCorrection -= 30 : 0;
      yield this.crashXCorrection;
    }
  }
// atualiza o estado do jogador com base na entrada do usuário, na pista e na câmera
  update(camera, road, director, oppArr) {
    const cameraClass = camera;
    const oppArrClass = oppArr;
    if (director.running) {
      this.sprite.name = 'Player';

      // Corretor de batida
      const alignAfterCrash = this.carXCrashState();
      if (alignAfterCrash.next().value) {
        let direction = Math.sign(this.x);
        if (handleInput.isKeyDown('arrowLeft')) direction = 1;
        if (handleInput.isKeyDown('arrowRight')) direction = -1;
        this.changeXToLeft(direction * 0.10);
      }

      // botão de recuperação de velocidade (para testes)
      if (handleInput.isKeyDown('*')) {
        // cameraClass.cursor = road.length - (road.segmentLength * road.kerbLength * 2);
        // this.x = 0;
        // this.runningPower = 1160;
      }
      // botão de redução de velocidade (para testes)
      if (handleInput.isKeyDown('-')) {
        // cameraClass.cursor = (road.length) - 200 * 200;
        // this.x = 0;
        // this.runningPower = 1200;
      }

      // função de aceleração/Y
      const acceleration = (speed, mult) => ((this.maxSpeed + 300) / (speed + 300))
        * mult * (1.5 - (speed / this.maxSpeed));
      let decelerationCurveBoost = 1;

      // desacelera fora da pista
      let segment = road.getSegment(camera.cursor);
      const midSpd = this.maxSpeed / 2;
      if (Math.abs(this.x) > 2.2 && segment.curve && this.runningPower > midSpd) {
        this.runningPower -= acceleration(this.runningPower, 7.2);
      } else if (Math.abs(this.x) > 1.6 && !segment.curve && this.runningPower > midSpd) {
        this.runningPower -= acceleration(this.runningPower, 7.2);
      }

      // controle de aceleração e frenagem
      if (handleInput.isKeyDown('arrowUp')) {
        if (this.runningPower === 0) this.startPress = window.performance.now();
        this.runningPower = this.runningPower >= this.maxSpeed
          ? this.maxSpeed : this.runningPower += acceleration(this.runningPower, 0.9);
        cameraClass.cursor += this.runningPower;
      } else if (handleInput.isKeyDown('arrowDown') && !handleInput.isKeyDown('arrowUp') && this.runningPower >= 0) {
        const brakePower = 6;
        this.runningPower = this.runningPower % brakePower === 0
          ? this.runningPower : Math.ceil(this.runningPower / brakePower) * brakePower;
        this.runningPower = this.runningPower <= 0 ? 0 : this.runningPower += -brakePower;
        decelerationCurveBoost = this.runningPower >= 10
          ? (1.125 + (this.maxSpeed - this.runningPower) / this.maxSpeed)
          : 1;
        cameraClass.cursor += this.runningPower;
      } else if (!handleInput.isKeyDown('arrowUp') && this.runningPower > 0) {
        this.runningPower = this.runningPower % 1 === 0
          ? this.runningPower
          : Math.ceil(this.runningPower);
        this.runningPower = this.runningPower < 2 ? 0 : this.runningPower += -2;
        cameraClass.cursor += this.runningPower;
        decelerationCurveBoost = this.runningPower >= 10
          ? (1.125 + (this.maxSpeed - this.runningPower) / this.maxSpeed)
          : 1;
      }

      // criando uma força centrífuga para puxar o carro
      segment = road.getSegment(camera.cursor);
      const playerPosition = (Math.floor((camera.cursor / road.segmentLength)));
      const baseForce = 0.06;
      this.centrifugalForce = Math.abs(
        baseForce * (this.runningPower / this.maxSpeed) * segment.curve,
      );
      if (playerPosition === segment.index && segment.curve && this.runningPower) {
        if (segment.curve < 0) this.changeXToRight(this.centrifugalForce);
        if (segment.curve > 0) this.changeXToLeft(this.centrifugalForce);
      }

      // fazendo o carro do jogador se mover no eixo X
      this.curvePower = baseForce * (this.runningPower / this.maxSpeed)
        * this.reforceCurvePowerLowSpeed();
      const curvePowerOnCentrifugalForce = (
        baseForce + Math.abs(4 * (segment.curve / 100))) * (this.runningPower / this.maxSpeed
      );
// controles de direção
      if (handleInput.isKeyDown('arrowleft') && this.runningPower !== 0 && segment.curve < 0) {
        this.curvePower = curvePowerOnCentrifugalForce * decelerationCurveBoost
          * this.reforceCurvePowerLowSpeed();
        this.changeXToLeft(this.curvePower);
      } else if (handleInput.isKeyDown('arrowleft') && this.runningPower !== 0 && segment.curve > 0) {
        this.curvePower = curvePowerOnCentrifugalForce / 40;
        this.centrifugalForce /= 40;
        this.changeXToLeft(this.curvePower);
      } else if (handleInput.isKeyDown('arrowleft') && this.runningPower !== 0) {
        this.curvePower *= 1.15;
        this.changeXToLeft(this.curvePower);
      } else if (handleInput.isKeyDown('arrowright') && this.runningPower !== 0 && segment.curve > 0) {
        this.curvePower = curvePowerOnCentrifugalForce * decelerationCurveBoost
          * this.reforceCurvePowerLowSpeed();
        this.changeXToRight(this.curvePower);
      } else if (handleInput.isKeyDown('arrowright') && this.runningPower !== 0 && segment.curve < 0) {
        this.curvePower = curvePowerOnCentrifugalForce / 40;
        this.centrifugalForce /= 40;
        this.changeXToRight(this.curvePower);
      } else if (handleInput.isKeyDown('arrowright') && this.runningPower !== 0) {
        this.curvePower *= 1.15;
        this.changeXToRight(this.curvePower);
      }
// atualiza a posição do jogador na pista
      this.trackPosition += this.runningPower;
      const { trackSize } = tracks[road.trackName];
      const actualPosition = this.trackPosition / 200;
      const actualLap = Math.floor(actualPosition / trackSize);
// atualiza o tempo de volta se o jogador completar uma volta
      if (this.lap < actualLap) {
        this.raceTime.push(director.totalTime);
        this.lap += 1;
      }

      // fazendo o carro do jogador colidir
      const baseSegment = segment.index;
      const lookupTrackside = 4;
      let crashLookup = 0;
      if (this.runningPower / this.maxSpeed < 0.5) crashLookup = 1;
      const minHit = baseSegment + lookupTrackside;
      for (let i = baseSegment; i <= minHit; i += 1) {
        const crashSegment = road.getSegmentFromIndex(i);
        for (let j = 0; j < crashSegment.sprites.length; j += 1) {
          const sprite = crashSegment.sprites[j];
          const { scale } = crashSegment;
          const ignoredSprites = ['tsStartLights'];
          const regexDrivers = /^op\w*/g;
          const isDriverSprite = regexDrivers.test(sprite.name);
          const callerW = this.sprite.scaleX * 320 * 0.001;
          const otherX = sprite.offsetX * 2;
          const otherSize = (sprite.width / sprite.spritesInX);
          const otherW = Math.min(scale * sprite.scaleX * otherSize, otherSize * 0.001);
          const overLapResponse = overlap(this.x, callerW, otherX, otherW, 1.1);
// fazendo a correção de velocidade e posição após a batida
          if (overLapResponse && !ignoredSprites.includes(sprite.name)
            && (i <= baseSegment + crashLookup || (i > baseSegment && !isDriverSprite))) {
            const { speed, mult } = sprite.runningPower;
            const differentialSpeedPercent = (this.runningPower - speed) / 1200;
            this.runningPower = calcCrashSpeed(this.runningPower, speed, mult);
            this.crashXCorrection += 300 * differentialSpeedPercent;
            cameraClass.cursor -= 300;
            const oppIndex = oppArrClass.findIndex((driver) => driver.sprite.name === sprite.name);
            if (oppIndex !== -1) {
              oppArrClass[oppIndex].maxSpeed *= (1 + Math.abs(differentialSpeedPercent / 6));
              oppArrClass[oppIndex].runningPower *= (1 + Math.abs(differentialSpeedPercent / 3));
              oppArrClass[oppIndex].isCrashed = 1;
            }
          }
        }
      }
      if (this.runningPower < 0) this.runningPower = 0;
      this.cursor = camera.cursor;
      camera.update(road, director);
    }
  }
// renderiza o jogador na tela
  /**
   *
   * @param {Render} render
   * @param {Camera} camera
   * @param {Number} roadWidth
   */
  render(render, camera, roadWidth) {
    const clip = 0;
    const scale = 1 / camera.h;
// desenha o sprite do jogador
    render.drawSprite(
      this.sprite, camera, this, roadWidth, scale,
      camera.screen.midpoint.x, camera.screen.height, clip,
      this.sprite.spritesInX, this.sprite.spritesInY,
    );
  }
}

export default Player;
