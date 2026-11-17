// Mock usado pelo Jest: o módulo nativo não existe no ambiente de testes.
class Sound {
  constructor(_source, callback) {
    setTimeout(() => callback && callback(null), 0);
  }
  play(onEnd) {
    onEnd && onEnd(true);
  }
  pause() {}
  stop(cb) {
    cb && cb();
  }
  setVolume() {}
  setNumberOfLoops() {}
  release() {}
}
Sound.setCategory = () => {};

module.exports = Sound;
module.exports.default = Sound;
