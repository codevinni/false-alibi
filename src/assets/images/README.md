# Imagens do False Alibi

Todas as imagens são registradas em `src/services/media/imageAssets.ts`.

| Pasta | Conteúdo | Id usado no código |
| --- | --- | --- |
| `backgrounds/` | fundos de tela (2400×1080) | `home_background`, `interrogation_room` |
| `banners/` | faixas de resultado (PNG, 1200×400) | `victory_banner`, `defeat_banner` |
| `characters/` | detetive do menu (PNG, 800×1200) | `detective` |
| `scenes/` | cenas de crime (1920×1080) | `scene_assassinato`, `scene_mansion_gallery`, `scene_roubo_banco`, `scene_sequestro` |
| `avatars/` | fichas policiais (512×512) | `avatar_<f\|m>_<jovem\|adulto\|idoso>_<n>` |

## Trocar uma imagem
Substitua o arquivo mantendo o nome (rode `npm start -- --reset-cache` se o
Metro mostrar a antiga) ou troque o `require(...)` em `imageAssets.ts`.

## Adicionar avatar ou cena
1. Coloque o arquivo na pasta (nome só com minúsculas, números e `_`).
2. Adicione o id em `SuspectAvatarId` ou `CrimeSceneImageId`
   (`src/types/media.services.types.ts`).
3. Registre em `SUSPECT_AVATARS` (com `gender` e `ageGroup`) ou em
   `CRIME_SCENE_IMAGES`. O TypeScript acusa erro enquanto faltar.

Observação: falta `avatar_f_adulto_1` — hoje há só uma variação de mulher
adulta. Basta adicionar o arquivo e registrá-lo como acima.
