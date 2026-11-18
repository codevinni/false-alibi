import { mockCrimeCase, mockSuspects } from '../src/mocks';
import {
  getAgeGroup,
  resolveCaseAvatarIds,
  resolveSuspectAvatarId,
} from '../src/services/media/avatarResolver';
import { imageService } from '../src/services/media/ImageService';
import {
  CRIME_SCENE_IMAGES,
  SUSPECT_AVATARS,
} from '../src/services/media/imageAssets';

describe('avatarResolver', () => {
  test('faixas etárias', () => {
    expect(getAgeGroup(22)).toBe('jovem');
    expect(getAgeGroup(29)).toBe('jovem');
    expect(getAgeGroup(30)).toBe('adulto');
    expect(getAgeGroup(54)).toBe('adulto');
    expect(getAgeGroup(55)).toBe('idoso');
  });

  test('respeita avatarId válido', () => {
    const id = resolveSuspectAvatarId({
      id: 'x',
      gender: 'masculino',
      age: 20,
      avatarId: 'avatar_f_idoso_1',
    });
    expect(id).toBe('avatar_f_idoso_1');
  });

  test('avatarId inválido cai no gênero e faixa etária', () => {
    const id = resolveSuspectAvatarId({
      id: 'suspect-9',
      gender: 'feminino',
      age: 70,
      avatarId: 'avatar_inexistente',
    });
    expect(SUSPECT_AVATARS[id].gender).toBe('feminino');
    expect(SUSPECT_AVATARS[id].ageGroup).toBe('idoso');
  });

  test('é determinístico', () => {
    const s = { id: 'abc', gender: 'masculino' as const, age: 40 };
    expect(resolveSuspectAvatarId(s)).toBe(resolveSuspectAvatarId(s));
  });

  test('não repete avatares dentro de um caso', () => {
    const map = resolveCaseAvatarIds(mockSuspects);
    const ids = [...map.values()];
    expect(ids.length).toBe(mockSuspects.length);
    expect(new Set(ids).size).toBe(ids.length);
    mockSuspects.forEach(s => {
      expect(SUSPECT_AVATARS[map.get(s.id)!].gender).toBe(s.gender);
    });
  });
});

describe('ImageService', () => {
  test('cena do caso usa sceneImageId', () => {
    expect(imageService.getSceneForCase(mockCrimeCase)).toBe(
      CRIME_SCENE_IMAGES.scene_mansion_gallery,
    );
  });

  test('cena cai para o tipo do caso quando não há sceneImageId', () => {
    const scene = imageService.getSceneForCase({
      ...mockCrimeCase,
      type: 'sequestro',
      sceneImageId: undefined,
    });
    expect(scene).toBe(CRIME_SCENE_IMAGES.scene_sequestro);
  });

  test('ids desconhecidos não quebram', () => {
    expect(imageService.getSuspectAvatar('toString')).toBeDefined();
    expect(imageService.getCrimeSceneImage('nada')).toBeDefined();
  });
});
