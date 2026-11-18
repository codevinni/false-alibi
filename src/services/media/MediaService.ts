import { ImageSourcePropType } from 'react-native';
import {
  IMediaService,
  SoundEffectType,
  StaticScreenImage,
} from '../../types/media.services.types';
import { MusicTrackType } from '../../types/audio.services.types';
import { audioService } from '../audio';
import { imageService } from './ImageService';

/**
 * Implementação completa do IMediaService: une o audioService (sons) e o
 * imageService (imagens) atrás do contrato original definido em
 * src/types/media.services.types.ts.
 *
 * Use quando quiser depender só do contrato (ex.: injeção em testes).
 * No dia a dia das telas, os hooks de ../audio e ./hooks são mais práticos.
 */
export class MediaService implements IMediaService {
  // Som
  playBackgroundMusic = (track?: MusicTrackType) =>
    audioService.playBackgroundMusic(track);
  stopBackgroundMusic = () => audioService.stopBackgroundMusic();
  setBackgroundMusicVolume = (volume: number) =>
    audioService.setBackgroundMusicVolume(volume);
  playSoundEffect = (effect: SoundEffectType) =>
    audioService.playSoundEffect(effect);

  // Imagens
  getSuspectAvatar = (avatarId: string): ImageSourcePropType =>
    imageService.getSuspectAvatar(avatarId);
  getCrimeSceneImage = (sceneImageId: string): ImageSourcePropType =>
    imageService.getCrimeSceneImage(sceneImageId);
  getStaticImage = (imageKey: StaticScreenImage): ImageSourcePropType =>
    imageService.getStaticImage(imageKey);
}

export const mediaService: IMediaService = new MediaService();
