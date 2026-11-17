import { AudioService } from '../src/services/audio/AudioService';
import {
  AudioDriver,
  AudioHandle,
} from '../src/services/audio/drivers/AudioDriver';
import { SoundAsset } from '../src/services/audio/soundAssets';
import {
  MusicTrackType,
  SoundEffectType,
} from '../src/types/audio.services.types';

// Driver falso que registra tudo o que o serviço pede
class FakeHandle implements AudioHandle {
  calls: string[] = [];
  volume = -1;
  loop = false;
  playing = false;
  play() {
    this.playing = true;
    this.calls.push('play');
  }
  pause() {
    this.playing = false;
    this.calls.push('pause');
  }
  stop(onStopped?: () => void) {
    this.playing = false;
    this.calls.push('stop');
    onStopped?.();
  }
  isPlaying() {
    return this.playing;
  }
  setVolume(v: number) {
    this.volume = v;
  }
  setLoop(l: boolean) {
    this.loop = l;
  }
  release() {
    this.calls.push('release');
  }
}

class FakeDriver implements AudioDriver {
  readonly name = 'fake';
  handles = new Map<number, FakeHandle>();
  setup() {}
  load(source: number) {
    const h = new FakeHandle();
    this.handles.set(source, h);
    return Promise.resolve(h);
  }
}

const sfx = {
  button_click: { source: 1, volume: 0.5 },
  new_case: { source: 2 },
  accusation: { source: 3 },
  victory: { source: 4 },
  defeat: { source: 5 },
} as Record<SoundEffectType, SoundAsset>;

const music = {
  main_theme: { source: 10 },
  investigation: { source: 11 },
} as Record<MusicTrackType, SoundAsset>;

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

function setup() {
  const driver = new FakeDriver();
  const service = new AudioService(driver, sfx, music);
  return { driver, service };
}

describe('AudioService', () => {
  test('init pré-carrega todos os efeitos', async () => {
    const { driver, service } = setup();
    await service.init();
    expect([...driver.handles.keys()].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  test('efeito usa master × sfx × volume do arquivo', async () => {
    const { driver, service } = setup();
    await service.init();
    service.setMasterVolume(0.5);
    service.setSoundEffectVolume(0.8);
    service.playSoundEffect('button_click');
    await flush();
    const h = driver.handles.get(1)!;
    expect(h.volume).toBeCloseTo(0.5 * 0.8 * 0.5);
    // não estava tocando: toca direto, sem stop
    expect(h.calls).toEqual(['play']);
  });

  test('efeito ainda tocando é reiniciado (stop + play)', async () => {
    const { driver, service } = setup();
    await service.init();
    service.playSoundEffect('new_case');
    await flush();
    await new Promise(resolve => setTimeout(resolve, 80)); // passa o cooldown
    service.playSoundEffect('new_case');
    await flush();
    expect(driver.handles.get(2)!.calls).toEqual(['play', 'stop', 'play']);
  });

  test('mute impede efeitos e zera a música sem pará-la', async () => {
    const { driver, service } = setup();
    await service.init();
    service.playBackgroundMusic('main_theme');
    await flush();
    service.setMuted(true);
    await flush();
    service.playSoundEffect('victory');
    await flush();
    expect(driver.handles.get(4)!.calls).toEqual([]);
    const m = driver.handles.get(10)!;
    expect(m.volume).toBe(0);
    expect(m.calls).toEqual(['play']);

    service.toggleMute();
    await flush();
    expect(m.volume).toBeGreaterThan(0);
  });

  test('música em loop, sem reiniciar a mesma faixa', async () => {
    const { driver, service } = setup();
    service.playBackgroundMusic();
    await flush();
    service.playBackgroundMusic('main_theme');
    await flush();
    const main = driver.handles.get(10)!;
    expect(main.loop).toBe(true);
    expect(main.calls).toEqual(['play']);

    service.playBackgroundMusic('investigation');
    await flush();
    expect(main.calls).toEqual(['play', 'stop']);
    expect(driver.handles.get(11)!.calls).toEqual(['play']);
    expect(service.getCurrentTrack()).toBe('investigation');
  });

  test('pause e resume', async () => {
    const { driver, service } = setup();
    service.playBackgroundMusic('main_theme');
    await flush();
    service.pauseBackgroundMusic();
    service.resumeBackgroundMusic();
    await flush();
    expect(driver.handles.get(10)!.calls).toEqual(['play', 'pause', 'play']);
  });

  test('volumes são limitados entre 0 e 1 e avisam os inscritos', () => {
    const { service } = setup();
    const listener = jest.fn();
    const unsubscribe = service.subscribe(listener);
    service.setBackgroundMusicVolume(3);
    service.setMasterVolume(-1);
    expect(service.getSettings().musicVolume).toBe(1);
    expect(service.getSettings().masterVolume).toBe(0);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    service.toggleMute();
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
