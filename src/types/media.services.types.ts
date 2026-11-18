import { ImageSourcePropType } from 'react-native';
import { SuspectGender } from './suspect.types';

// Tipos de efeitos sonoros
export type SoundEffectType = 'button_click' | 'new_case' | 'accusation' | 'victory' | 'defeat';

export type StaticScreenImage =
    | 'home_background'
    | 'interrogation_room'
    | 'detective'
    | 'victory_banner'
    | 'defeat_banner';

// Imagens das cenas de crime (src/assets/images/scenes/)
export type CrimeSceneImageId =
    | 'scene_assassinato'
    | 'scene_mansion_gallery'
    | 'scene_roubo_banco'
    | 'scene_sequestro';

// Faixa etária usada para escolher o avatar de um suspeito
export type AvatarAgeGroup = 'jovem' | 'adulto' | 'idoso';

// Avatares de suspeitos (src/assets/images/avatars/)
// Padrão do nome: avatar_<f|m>_<faixa etária>_<variação>
export type SuspectAvatarId =
    | 'avatar_f_jovem_1'
    | 'avatar_f_jovem_2'
    | 'avatar_f_adulto_2'
    | 'avatar_f_idoso_1'
    | 'avatar_f_idoso_2'
    | 'avatar_m_jovem_1'
    | 'avatar_m_jovem_2'
    | 'avatar_m_adulto_1'
    | 'avatar_m_adulto_2'
    | 'avatar_m_idoso_1'
    | 'avatar_m_idoso_2';

export interface SuspectAvatarAsset {
    gender: SuspectGender;
    ageGroup: AvatarAgeGroup;
    source: ImageSourcePropType;
}

export interface IMediaService {

    // Controles pra musica de fundo
    playBackgroundMusic: () => void;
    stopBackgroundMusic: () => void;
    setBackgroundMusicVolume: (volume: number) => void;

    // Efeitos sonoros de interação
    playSoundEffect: (effect: SoundEffectType) => void;

    // Imagens
    getSuspectAvatar: (avatarId: string) => ImageSourcePropType;
    getCrimeSceneImage: (sceneImageId: string) => ImageSourcePropType;
    getStaticImage: (imageKey: StaticScreenImage) => ImageSourcePropType;
}