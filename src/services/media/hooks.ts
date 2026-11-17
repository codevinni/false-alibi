import { useMemo } from 'react';
import { ImageSourcePropType } from 'react-native';
import { CrimeCase, Suspect } from '../../types';
import {
  StaticScreenImage,
  SuspectAvatarId,
} from '../../types/media.services.types';
import { resolveCaseAvatarIds } from './avatarResolver';
import { SUSPECT_AVATARS } from './imageAssets';
import { imageService } from './ImageService';

/** Imagem fixa de tela (fundo, banner, detetive). */
export function useStaticImage(key: StaticScreenImage): ImageSourcePropType {
  return useMemo(() => imageService.getStaticImage(key), [key]);
}

/** Imagem da cena do crime de um caso. */
export function useCrimeSceneImage(crimeCase: CrimeCase): ImageSourcePropType {
  return useMemo(
    () => imageService.getSceneForCase(crimeCase),
    [crimeCase],
  );
}

/**
 * Avatares de todos os suspeitos do caso, sem repetição.
 * Uso: const getAvatar = useCaseAvatars(crimeCase); getAvatar(suspect)
 */
export function useCaseAvatars(crimeCase: CrimeCase) {
  const ids = useMemo(
    () => resolveCaseAvatarIds(crimeCase.suspects),
    [crimeCase],
  );
  return useMemo(
    () =>
      (suspect: Suspect): ImageSourcePropType => {
        const id: SuspectAvatarId | undefined = ids.get(suspect.id);
        return id
          ? SUSPECT_AVATARS[id].source
          : imageService.getAvatarForSuspect(suspect);
      },
    [ids],
  );
}

/** Avatar de um suspeito, consistente com o que aparece no quadro do caso. */
export function useSuspectAvatar(
  suspect: Suspect,
  crimeCase?: CrimeCase,
): ImageSourcePropType {
  return useMemo(
    () => imageService.getAvatarForSuspect(suspect, crimeCase),
    [suspect, crimeCase],
  );
}
