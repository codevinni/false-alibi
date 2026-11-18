/**
 * REGISTRO DE IMAGENS — único lugar com os require() das imagens do jogo.
 *
 * Para trocar uma imagem: substitua o arquivo em src/assets/images/
 * (mesmo nome) ou aponte o require() abaixo para outro arquivo.
 *
 * Para adicionar um avatar ou cena nova:
 *   1. Coloque o arquivo na pasta correspondente.
 *   2. Adicione o id no tipo (SuspectAvatarId ou CrimeSceneImageId em
 *      src/types/media.services.types.ts).
 *   3. Adicione a entrada aqui — o TypeScript avisa enquanto faltar.
 *
 * Formatos recomendados: .jpg para fundos/cenas/avatares, .png quando a
 * imagem precisa de transparência (banners, detetive).
 */
import { ImageSourcePropType } from 'react-native';
import { CaseType } from '../../types';
import {
  CrimeSceneImageId,
  StaticScreenImage,
  SuspectAvatarAsset,
  SuspectAvatarId,
} from '../../types/media.services.types';

// --------------------------------------------------------------- telas ---

export const STATIC_IMAGES: Record<StaticScreenImage, ImageSourcePropType> = {
  home_background: require('../../assets/images/backgrounds/home_background.jpg'),
  interrogation_room: require('../../assets/images/backgrounds/interrogation_room.jpg'),
  detective: require('../../assets/images/characters/detective.png'),
  victory_banner: require('../../assets/images/banners/victory_banner.png'),
  defeat_banner: require('../../assets/images/banners/defeat_banner.png'),
};

// ---------------------------------------------------------------- cenas ---

export const CRIME_SCENE_IMAGES: Record<CrimeSceneImageId, ImageSourcePropType> =
  {
    scene_assassinato: require('../../assets/images/scenes/scene_assassinato.jpg'),
    scene_mansion_gallery: require('../../assets/images/scenes/scene_mansion_gallery.jpg'),
    scene_roubo_banco: require('../../assets/images/scenes/scene_roubo_banco.jpg'),
    scene_sequestro: require('../../assets/images/scenes/scene_sequestro.jpg'),
  };

// Cena usada quando o caso não informa sceneImageId (ou informa um inválido)
export const CASE_TYPE_DEFAULT_SCENE: Record<CaseType, CrimeSceneImageId> = {
  assassinato: 'scene_assassinato',
  roubo_banco: 'scene_roubo_banco',
  sequestro: 'scene_sequestro',
  furto_arte: 'scene_mansion_gallery',
};

export const FALLBACK_SCENE_ID: CrimeSceneImageId = 'scene_mansion_gallery';

// ------------------------------------------------------------- avatares ---

export const SUSPECT_AVATARS: Record<SuspectAvatarId, SuspectAvatarAsset> = {
  avatar_f_jovem_1: {
    gender: 'feminino',
    ageGroup: 'jovem',
    source: require('../../assets/images/avatars/avatar_f_jovem_1.jpg'),
  },
  avatar_f_jovem_2: {
    gender: 'feminino',
    ageGroup: 'jovem',
    source: require('../../assets/images/avatars/avatar_f_jovem_2.jpg'),
  },
  avatar_f_adulto_2: {
    gender: 'feminino',
    ageGroup: 'adulto',
    source: require('../../assets/images/avatars/avatar_f_adulto_2.jpg'),
  },
  avatar_f_idoso_1: {
    gender: 'feminino',
    ageGroup: 'idoso',
    source: require('../../assets/images/avatars/avatar_f_idoso_1.jpg'),
  },
  avatar_f_idoso_2: {
    gender: 'feminino',
    ageGroup: 'idoso',
    source: require('../../assets/images/avatars/avatar_f_idoso_2.jpg'),
  },
  avatar_m_jovem_1: {
    gender: 'masculino',
    ageGroup: 'jovem',
    source: require('../../assets/images/avatars/avatar_m_jovem_1.jpg'),
  },
  avatar_m_jovem_2: {
    gender: 'masculino',
    ageGroup: 'jovem',
    source: require('../../assets/images/avatars/avatar_m_jovem_2.jpg'),
  },
  avatar_m_adulto_1: {
    gender: 'masculino',
    ageGroup: 'adulto',
    source: require('../../assets/images/avatars/avatar_m_adulto_1.jpg'),
  },
  avatar_m_adulto_2: {
    gender: 'masculino',
    ageGroup: 'adulto',
    source: require('../../assets/images/avatars/avatar_m_adulto_2.jpg'),
  },
  avatar_m_idoso_1: {
    gender: 'masculino',
    ageGroup: 'idoso',
    source: require('../../assets/images/avatars/avatar_m_idoso_1.jpg'),
  },
  avatar_m_idoso_2: {
    gender: 'masculino',
    ageGroup: 'idoso',
    source: require('../../assets/images/avatars/avatar_m_idoso_2.jpg'),
  },
};

export const FALLBACK_AVATAR_ID: SuspectAvatarId = 'avatar_m_adulto_1';
