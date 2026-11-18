// Mock usado pelo Jest: o módulo nativo não existe no ambiente de testes.
class Sound {
  // Aceita (caminho, callback) e (caminho, basePath, callback)
  constructor(_path, basePathOrCallback, callback) {
    const cb =
      typeof basePathOrCallback === 'function' ? basePathOrCallback : callback;
    setTimeout(() => cb && cb(null), 0);
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
