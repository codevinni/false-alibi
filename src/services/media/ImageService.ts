import { ImageSourcePropType } from 'react-native';
import { CrimeCase, Suspect } from '../../types';
import {
  CrimeSceneImageId,
  IMediaService,
  StaticScreenImage,
} from '../../types/media.services.types';
import {
  CASE_TYPE_DEFAULT_SCENE,
  CRIME_SCENE_IMAGES,
  FALLBACK_AVATAR_ID,
  FALLBACK_SCENE_ID,
  STATIC_IMAGES,
  SUSPECT_AVATARS,
} from './imageAssets';
import {
  isSuspectAvatarId,
  resolveCaseAvatarIds,
  resolveSuspectAvatarId,
} from './avatarResolver';

const warn = (...args: unknown[]) => {
  if (__DEV__) {
    console.warn('[ImageService]', ...args);
  }
};

const isCrimeSceneId = (id: unknown): id is CrimeSceneImageId =>
  typeof id === 'string' &&
  Object.prototype.hasOwnProperty.call(CRIME_SCENE_IMAGES, id);

/**
 * Entrega as imagens do jogo a partir de ids.
 * Nunca lança erro: id desconhecido → aviso em modo dev + imagem padrão.
 */
export class ImageService
  implements
    Pick<
      IMediaService,
      'getSuspectAvatar' | 'getCrimeSceneImage' | 'getStaticImage'
    >
{
  // ------------------------------------------ contrato do IMediaService ---

  getStaticImage = (imageKey: StaticScreenImage): ImageSourcePropType => {
    const image = STATIC_IMAGES[imageKey];
    if (!image) {
      warn(`imagem "${imageKey}" não registrada em imageAssets.ts`);
    }
    return image;
  };

  getSuspectAvatar = (avatarId: string): ImageSourcePropType => {
    if (isSuspectAvatarId(avatarId)) {
      return SUSPECT_AVATARS[avatarId].source;
    }
    warn(`avatar "${avatarId}" desconhecido; usando o padrão`);
    return SUSPECT_AVATARS[FALLBACK_AVATAR_ID].source;
  };

  getCrimeSceneImage = (sceneImageId: string): ImageSourcePropType => {
    if (isCrimeSceneId(sceneImageId)) {
      return CRIME_SCENE_IMAGES[sceneImageId];
    }
    warn(`cena "${sceneImageId}" desconhecida; usando a padrão`);
    return CRIME_SCENE_IMAGES[FALLBACK_SCENE_ID];
  };

  // ------------------------------------------------- atalhos do jogo ---

  /** Avatar de um suspeito, mesmo que o avatarId esteja ausente/inválido. */
  getAvatarForSuspect = (
    suspect: Suspect | undefined,
    crimeCase?: CrimeCase,
  ): ImageSourcePropType => {
    if (!suspect) {
      warn('getAvatarForSuspect chamado sem suspeito; usando o padrão');
      return SUSPECT_AVATARS[FALLBACK_AVATAR_ID].source;
    }
    const avatarId = crimeCase?.suspects
      ? resolveCaseAvatarIds(crimeCase.suspects).get(suspect.id) ??
        resolveSuspectAvatarId(suspect)
      : resolveSuspectAvatarId(suspect);
    return SUSPECT_AVATARS[avatarId].source;
  };

  /** Cena do caso: usa sceneImageId ou, se ausente, a cena do tipo do caso. */
  getSceneForCase = (
    crimeCase: CrimeCase | undefined,
  ): ImageSourcePropType => {
    if (!crimeCase) {
      warn('getSceneForCase chamado sem caso; usando a cena padrão');
      return CRIME_SCENE_IMAGES[FALLBACK_SCENE_ID];
    }
    if (isCrimeSceneId(crimeCase.sceneImageId)) {
      return CRIME_SCENE_IMAGES[crimeCase.sceneImageId];
    }
    const sceneId = CASE_TYPE_DEFAULT_SCENE[crimeCase.type] ?? FALLBACK_SCENE_ID;
    return CRIME_SCENE_IMAGES[sceneId];
  };
}

export const imageService = new ImageService();
