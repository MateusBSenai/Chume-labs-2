import { degToRad, speedToDeg } from './util.js';
// classe que representa o velocímetro do carro
class Tachometer {
  constructor() {
    this.runningPower = 0;
  }
// atualiza a potência do carro com base no estado do diretor
  update(player, director) {
    if (director.paused) {
      this.runningPower = player.runningPower;
      if (this.runningPower > 1140) {
        this.runningPower = this.runningPower - 2 + Math.random() * 6;
      }
    }
  }
// desenha a agulha do velocímetro
  drawNeedle(options) {
    const {
      context, x, y, radius,
    } = options;
// calcula o ângulo da agulha com base na potência do carro
    const speedAngle = speedToDeg(this.runningPower / 4, 360, -30, 210);
    const speedRad = degToRad(speedAngle);
    const onArcX = radius - (Math.cos(speedRad) * 0);
    const onArcY = radius - (Math.sin(speedRad) * 0);
    const innerX = radius - (Math.cos(speedRad) * (radius * 0.7));
    const innerY = radius - (Math.sin(speedRad) * (radius * 0.7));
// calcula as coordenadas da agulha
    const fromX = x - radius + onArcX;
    const fromY = y - radius + onArcY;
// desenha a agulha
    const toX = x - radius + innerX;
    const toY = y - radius + innerY;
// desenha a agulha do velocímetro
    context.save();
    context.beginPath();
    context.strokeStyle = '#f00';
    context.lineWidth = 2;
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);
    context.stroke();
    context.restore();
  }
// desenha o mostrador do velocímetro
  static drawNeedleDial(options) {
    const {
      context, x, y, radius,
    } = options;
// desenha o mostrador do velocímetro
    const sColor = 'rgb(127, 127, 127)';
    const fColor = 'rgb(255,255,255)';
    for (let i = 0; i < 8; i += 1) {
      context.save();
      context.globalAlpha = 0.6;
      context.lineWidth = 3;
      context.beginPath();
      context.strokeStyle = sColor;
      context.fillStyle = fColor;
      context.arc(x, y, i, 15, Math.PI, true);
      context.fill();
      context.stroke();
      context.restore();
    }
  }
// desenha o arco metálico externo do velocímetro
  static outerMettalicArc(options) {
    const {
      context, x, y, radius, arcY,
    } = options;
    context.save();
    context.globalAlpha = 0.75;
    context.beginPath();
    context.fillStyle = 'rgb(63,63,63)';
    context.arc(x, y, radius, arcY, Math.PI, true);
    context.fill();
    context.restore();
  }
// desenha as marcas do velocímetro
  static drawMarks(options) {
    const {
      context, x, y, radius,
    } = options;
    for (let i = -30; i <= 210; i += 40) {
      const iRad = degToRad(i);
      const onArcX = radius - (Math.cos(iRad) * (radius - 10));
      const onArcY = radius - (Math.sin(iRad) * (radius - 10));
      const innerX = radius - (Math.cos(iRad) * radius);
      const innerY = radius - (Math.sin(iRad) * radius);
// calcula as coordenadas das marcas do velocímetro
      const fromX = x - radius + onArcX;
      const fromY = y - radius + onArcY;
// desenha as marcas do velocímetro
      const toX = x - radius + innerX;
      const toY = y - radius + innerY;
// desenha as marcas do velocímetro
      context.save();
      context.beginPath();
      context.strokeStyle = '#FFFFFF';
      context.lineWidth = 1.5;
      context.moveTo(fromX, fromY);
      context.lineTo(toX, toY);
      context.stroke();
      context.restore();
    }
// desenha as marcas menores do velocímetro
    for (let i = -10; i <= 210; i += 40) {
      const iRad = degToRad(i);
      const onArcX = radius - (Math.cos(iRad) * (radius - 5));
      const onArcY = radius - (Math.sin(iRad) * (radius - 5));
      const innerX = radius - (Math.cos(iRad) * radius);
      const innerY = radius - (Math.sin(iRad) * radius);
// calcula as coordenadas das marcas menores do velocímetro
      const fromX = x - radius + onArcX;
      const fromY = y - radius + onArcY;
// desenha as marcas menores do velocímetro
      const toX = x - radius + innerX;
      const toY = y - radius + innerY;
// desenha as marcas menores do velocímetro
      context.save();
      context.beginPath();
      context.strokeStyle = '#000000';
      context.lineWidth = 1.5;
      context.moveTo(fromX, fromY);
      context.lineTo(toX, toY);
      context.stroke();
      context.restore();
    }
  }
// desenha os números do velocímetro
  static drawText(options, render) {
    const { x, y, radius } = options;
// desenha os números do velocímetro
    for (let i = -30, n = 0; i <= 210; i += 40) {
      n += 1;
      const iRad = degToRad(i);
      const onArcX = radius - (Math.cos(iRad) * (radius - 19 - (n * 0.8)));
      const yFix = n !== 4 ? 4 : -1;
      const onArcY = radius - (Math.sin(iRad) * (radius - 15 - yFix));
// calcula as coordenadas dos números do velocímetro
      const fromX = x - radius + onArcX;
      const fromY = y - radius + onArcY;
// desenha os números do velocímetro
      const speed = 10 + i + 20 * n;
      render.drawText('#000', speed, fromX, fromY, 0.75, 'OutRiderCond', 'center', '#000', false);
    }
  }
// desenha o arco colorido do velocímetro
  static drawColorArc(options, render) {
    const {
      context, x, y, radius,
    } = options;
    const start = degToRad(149.5);
    const endGreen = degToRad(291);
    const endYellow = degToRad(10);
    const endRed = degToRad(30.5);
    context.save();
    context.lineWidth = 3;
    render.drawCircle(x, y, radius + 1, start, endGreen, false, 'rgb(82, 240, 55)');
    render.drawCircle(x, y, radius + 1, endGreen, endYellow, false, 'yellow');
    render.drawCircle(x, y, radius + 1, endYellow, endRed, false, 'red');
    context.restore();
  }
// renderiza o velocímetro na tela
  render(render) {
    const { renderingContext } = render;
    const options = {
      context: renderingContext,
      x: 570,
      y: 300,
      radius: 50,
      arcX: 50,
      arcY: 15,
    };
    Tachometer.outerMettalicArc(options);
    Tachometer.drawMarks(options);
    Tachometer.drawText(options, render);
    Tachometer.drawColorArc(options, render);
    Tachometer.drawNeedleDial(options, render);
    this.drawNeedle(options);
  }
}
// exporta a classe Tachometer para uso em outros módulos
export default Tachometer;
