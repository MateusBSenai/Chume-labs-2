// Definition of Tunnel class representing a tunnel segment in the racing game
class Tunnel {
  /**
   * @type {String}
   */
  title;
// largura do túnel
  /**
   * @type {Number}
   */
  py;
// altura do túnel
  /** 
   * @type {Number}
   */
  clipH;
// profundidade do túnel
  /** 
   * @type {Number}
   */

// profundidade do túnel
  worldH;
  leftFace = new class {
    offsetX1 = 1.3;
    offsetX2 = 1.3;
  };
  rightFace = new class {
    offsetX1 = 1.3;
    offsetX2 = 1.3;
  };
// faces visíveis do túnel
  visibleFaces = new class {
    leftFront = true;
    rightFront = true;
    centerFront = true;
    leftTop = true;
    rightTop = true;
    centerTop = true;
    leftCover = true;
    rightCover = true;
  };
// segmento anterior do túnel
  /**
   * @type {SegmentLine}
   */
  previousSegment;
}
// exporta a classe Tunnel para uso em outros módulos
export default Tunnel;
