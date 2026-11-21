# Imagens do False Alibi

Todas as imagens são registradas em `src/services/media/imageAssets.ts`.

| Pasta | Conteúdo | Id usado no código |
| --- | --- | --- |
| `backgrounds/` | fundos de tela (home 1875×839, suspeitos 1802×819, interrogatório 2400×1080) | `home_background`, `suspects_background`, `interrogation_room` |
| `banners/` | arte de resultado sem texto, arte à esquerda e fundo escuro à direita (JPG, 2172×987 — formato de tela de celular, com fundo estendido em cima e embaixo) | `victory_banner`, `defeat_banner` |
| `characters/` | retrato do detetive (PNG 768×768, fundo transparente) — registrado, ainda não exibido em nenhuma tela | `detective` |
| `scenes/` | cenas de crime (paisagem, ~16:9) | `scene_assassinato`, `scene_mansion_gallery`, `scene_roubo_banco`, `scene_sequestro` |
| `branding/` | logo do jogo (PNG transparente) | `logo` (tela inicial) |
| `avatars/` | retratos dos suspeitos (PNG 512×512, fundo transparente) — 3 por gênero e faixa etária, 18 no total | `avatar_<f\|m>_<jovem\|adulto\|idoso>_<1-3>` |

## Trocar uma imagem
Substitua o arquivo mantendo o nome (rode `npm start -- --reset-cache` se o
Metro mostrar a antiga) ou troque o `require(...)` em `imageAssets.ts`.

## Adicionar avatar ou cena
1. Coloque o arquivo na pasta (nome só com minúsculas, números e `_`).
2. Adicione o id em `SuspectAvatarId` ou `CrimeSceneImageId`
   (`src/types/media.services.types.ts`).
3. Registre em `SUSPECT_AVATARS` (com `gender` e `ageGroup`) ou em
   `CRIME_SCENE_IMAGES`. O TypeScript acusa erro enquanto faltar.

