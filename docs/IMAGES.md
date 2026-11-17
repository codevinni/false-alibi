# Sistema de imagens do False Alibi

Complementa o [sistema de som](./AUDIO.md). Explica como as imagens são
registradas, como o jogo escolhe avatares e cenas e o que mudou nas telas.

---

## 1. Visão geral

```
Telas
  │  hooks (useStaticImage, useCrimeSceneImage, useCaseAvatars, useSuspectAvatar)
  │  componentes (ScreenBackground, SuspectAvatar)
  ▼
imageService  (src/services/media/ImageService.ts)
  │  ids → imagens, com imagem padrão para ids desconhecidos
  ├── avatarResolver.ts  → escolhe o avatar de cada suspeito
  ▼
imageAssets.ts  → require() de cada arquivo em src/assets/images/

mediaService (MediaService.ts) = audioService + imageService
  → implementação completa do contrato IMediaService
```

Não há dependência nova: tudo usa `Image`/`ImageBackground` do React Native.

---

## 2. Arquivos de `src/services/media/`

| Arquivo | Responsabilidade |
| --- | --- |
| `imageAssets.ts` | **Registro de imagens** — único lugar com os `require()`; também define a cena padrão de cada tipo de caso e os fallbacks. |
| `avatarResolver.ts` | Regras de escolha de avatar (funções puras, testáveis). |
| `ImageService.ts` | `getStaticImage`, `getSuspectAvatar`, `getCrimeSceneImage` (contrato do `IMediaService`) + atalhos `getAvatarForSuspect` e `getSceneForCase`. |
| `MediaService.ts` | `mediaService`: implementa o `IMediaService` inteiro delegando som ao `audioService` e imagens ao `imageService`. |
| `hooks.ts` | Hooks para as telas. |
| `media.config.ts` | Limites de idade das faixas etárias e escurecimento padrão dos fundos. |
| `index.ts` | Ponto de importação: `import { ... } from '../services/media'`. |

Tipos novos em `src/types/media.services.types.ts`: `CrimeSceneImageId`,
`SuspectAvatarId`, `AvatarAgeGroup` e `SuspectAvatarAsset`. O
`IMediaService` original não mudou.

---

## 3. Como as imagens são escolhidas

### 3.1 Imagens fixas
`getStaticImage('home_background' | 'interrogation_room' | 'detective' |
'victory_banner' | 'defeat_banner')` — exatamente o `StaticScreenImage` que já
existia.

### 3.2 Cena do crime
1. Se o caso tem `sceneImageId` válido, usa essa cena.
2. Senão, usa a cena do tipo do caso (`CASE_TYPE_DEFAULT_SCENE`):

| `CaseType` | Cena |
| --- | --- |
| `assassinato` | `scene_assassinato` |
| `roubo_banco` | `scene_roubo_banco` |
| `sequestro` | `scene_sequestro` |
| `furto_arte` | `scene_mansion_gallery` |

### 3.3 Avatar do suspeito
1. Se `suspect.avatarId` é um id registrado (ex.: `avatar_m_idoso_2`), usa ele —
   útil para a IA escolher o avatar ao gerar o caso.
2. Senão, escolhe entre os avatares do **mesmo gênero e faixa etária**:
   - `jovem`: até 29 anos;
   - `adulto`: 30 a 54;
   - `idoso`: 55 ou mais (limites em `media.config.ts`).
3. Sem opções nessa combinação → mesmo gênero → qualquer avatar.

A escolha usa um hash do `id` do suspeito: **o mesmo suspeito tem sempre o
mesmo rosto**, em qualquer tela. Para um caso inteiro
(`resolveCaseAvatarIds`), o resolvedor **evita repetir avatares** enquanto
houver opções livres.

Os mocks atuais usam ids como `avatar_arthur`, que não existem; por isso caem
na regra 2 — Arthur (48, masculino) recebe um `avatar_m_adulto_*`, Sofia (29,
feminino) um `avatar_f_jovem_*`, e assim por diante.

### 3.4 Ids desconhecidos
Nada quebra: o serviço mostra um aviso no console (só em modo dev) e devolve a
imagem padrão (`FALLBACK_AVATAR_ID` / `FALLBACK_SCENE_ID`).

---

## 4. Hooks e componentes

| Hook | Uso |
| --- | --- |
| `useStaticImage(chave)` | Fundo, banner ou detetive. |
| `useCrimeSceneImage(caso)` | Cena do caso (regras da seção 3.2). |
| `useCaseAvatars(caso)` | Retorna `getAvatar(suspeito)` com avatares sem repetição no caso. |
| `useSuspectAvatar(suspeito, caso?)` | Avatar de um suspeito; passando o caso, fica igual ao do quadro de suspeitos. |

| Componente | Uso |
| --- | --- |
| `components/ScreenBackground.tsx` | Imagem de fundo em *cover* com camada escura ajustável (`overlayOpacity`) para o texto ficar legível. |
| `components/SuspectAvatar.tsx` | Foto de ficha policial quadrada, com `size` e rótulo de acessibilidade. |

Exemplo:

```tsx
const getAvatar = useCaseAvatars(crimeCase);
const background = useStaticImage('home_background');

<ScreenBackground source={background} overlayOpacity={0.6}>
  <SuspectAvatar source={getAvatar(suspect)} name={suspect.name} size={110} />
</ScreenBackground>
```

---

## 5. Mudanças nas telas

| Tela | Imagens |
| --- | --- |
| `HomeScreen` | Fundo `home_background` (quadro de investigação à esquerda fica visível), detetive à direita, menu no centro; botões semitransparentes e sombra no título. |
| `BriefingScreen` | Fundo com a **cena do crime** do caso; card do briefing movido para a direita e semitransparente. |
| `SuspectsScreen` | Fundo do quadro escurecido; **foto de cada suspeito** no card. |
| `InterrogationScreen` | Fundo `interrogation_room`; painel à esquerda (sobre o espelho) com a **foto do suspeito**. |
| `HistoryScreen` | Fundo da sala escurecido; foto pequena do suspeito ao lado do título. |
| `ResultScreen` | Fundo com a cena do crime escurecida; o texto "VITÓRIA/DERROTA" foi trocado pelo **banner** (`victory_banner`/`defeat_banner`, com o texto como rótulo de acessibilidade); foto do suspeito acusado. |

`SettingsScreen` não mudou.

---

## 6. Assets

Em `src/assets/images/` (o `.gitkeep` foi removido):

```
backgrounds/  home_background.jpg, interrogation_room.jpg
banners/      victory_banner.png, defeat_banner.png
characters/   detective.png
scenes/       scene_assassinato.jpg, scene_mansion_gallery.jpg,
              scene_roubo_banco.jpg, scene_sequestro.jpg
avatars/      avatar_f_jovem_1/2, avatar_f_adulto_2, avatar_f_idoso_1/2,
              avatar_m_jovem_1/2, avatar_m_adulto_1/2, avatar_m_idoso_1/2 (.jpg)
```

Como trocar ou adicionar imagens: veja `src/assets/images/README.md`.

---

## 7. Testes

`__tests__/media.test.ts`: faixas etárias, prioridade do `avatarId`, fallback
por gênero/idade, determinismo, ausência de repetição no caso, escolha da cena
por id e por tipo, e ids desconhecidos.

## 8. Pontos de atenção

- Os layouts foram pensados para paisagem; vale conferir no emulador e
  ajustar posições/opacidades (`overlayOpacity`, `paddingLeft` da Home,
  `alignItems` do Briefing e do Interrogatório) ao gosto.
- Há só uma variação de avatar feminino adulto (`avatar_f_adulto_2`); com duas
  ou mais mulheres adultas no mesmo caso, o resolvedor usa outra faixa etária
  do mesmo gênero para não repetir rostos.
- Os fundos têm 450–580 KB cada; se o APK ficar pesado, dá para recomprimir os
  JPGs (qualidade ~80) sem perda visível.
