import { ImageSourcePropType } from 'react-native';

// Tipos de efeitos sonoros
export type SoundEffectType = 'button_click' | 'new_case' | 'accusation' | 'victory' | 'defeat';

export type StaticScreenImage =
    | 'home_background'
    | 'interrogation_room'
    | 'detective'
    | 'victory_banner'
    | 'defeat_banner';

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