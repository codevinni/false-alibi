# Sistema de som do False Alibi

Este documento explica como funciona o áudio do jogo (música de fundo, efeitos
sonoros, volume e mute) e lista as alterações feitas fora de `src/services/`
para integrá-lo.

---

## 1. Visão geral

```
Telas / componentes
   │  hooks (useBackgroundMusic, useSoundHandler, ...)
   ▼
audioService  (instância única — src/services/audio/audioServiceInstance.ts)
   │  regras: volumes, mute, loop, troca de faixa, cache, pausa em 2º plano
   ▼
AudioDriver  (interface)
   ├── ReactNativeSoundDriver  → biblioteca react-native-sound
   └── SilentAudioDriver       → não toca nada (testes / fallback)
   ▲
soundAssets.ts  → qual arquivo de src/assets/sounds/ corresponde a cada som
```

As telas nunca falam com a biblioteca de áudio diretamente: elas chamam o
`audioService` (ou os hooks). O serviço aplica as regras do jogo e repassa as
ordens ao **driver**, que é a única camada que conhece a biblioteca nativa.

**Dependência nova:** `react-native-sound` (`^0.13.0`, compatível com a New
Architecture). Depois de atualizar o código, rode `npm install` e recompile o
app (`npm run android`).

---

## 2. Arquivos de `src/services/audio/`

| Arquivo | Responsabilidade |
| --- | --- |
| `AudioService.ts` | Classe principal: música, efeitos, volumes, mute, cache de sons, pausa automática. |
| `audioServiceInstance.ts` | Cria a instância única `audioService` e escolhe o driver (cai para o mudo se a lib nativa falhar). |
| `soundAssets.ts` | **Registro de sons** — único lugar com os `require()` dos arquivos. |
| `audio.config.ts` | Valores padrão: volumes iniciais, faixa padrão, passo do volume, intervalo entre cliques. |
| `hooks.ts` | Hooks React para usar o serviço nas telas. |
| `drivers/AudioDriver.ts` | Interface que qualquer biblioteca de áudio precisa implementar. |
| `drivers/ReactNativeSoundDriver.ts` | Implementação com `react-native-sound` (único arquivo que importa a lib). |
| `drivers/SilentAudioDriver.ts` | Implementação muda (Jest e fallback). |
| `index.ts` | Ponto de importação: `import { audioService, ... } from '../services/audio'`. |

O tipo `IAudioService` fica em `src/types/audio.services.types.ts`. Ele reaproveita
as assinaturas de áudio do `IMediaService` já existente (`playBackgroundMusic`,
`stopBackgroundMusic`, `setBackgroundMusicVolume`, `playSoundEffect`) e
acrescenta os controles extras. Assim, um futuro `MediaService` (imagens + áudio)
pode simplesmente delegar a parte sonora ao `audioService`.

---

## 3. Como o serviço funciona

### 3.1 Volume

O volume real de cada som é calculado assim:

```
volume final = volume geral × volume do canal × volume do arquivo
```

- **volume geral** (`masterVolume`): afeta tudo;
- **volume do canal**: `musicVolume` para música, `sfxVolume` para efeitos;
- **volume do arquivo**: campo `volume` em `soundAssets.ts` (serve para
  equilibrar um arquivo mais alto que os outros).

Todos os valores vão de 0 a 1; valores fora disso são ajustados automaticamente.

### 3.2 Mute

- Efeitos: com mute ligado, simplesmente não tocam.
- Música: continua tocando com volume 0. Ao desligar o mute ela volta do ponto
  em que estava, sem recomeçar.

### 3.3 Música de fundo

- `playBackgroundMusic(faixa)` toca em loop infinito.
- Pedir a faixa que já está tocando **não reinicia** a música (por isso várias
  telas podem pedir a mesma faixa sem problema).
- Pedir outra faixa para a atual e inicia a nova.
- As músicas só são carregadas na primeira vez em que são pedidas.
- Quando o app vai para segundo plano, a música pausa; ao voltar, retoma.

### 3.4 Efeitos sonoros

- São pré-carregados em `init()`, para tocar sem atraso no primeiro toque.
- Se o mesmo efeito for disparado de novo enquanto toca, ele recomeça.
- Há um intervalo mínimo de 60 ms entre duas execuções do mesmo efeito
  (`SFX_COOLDOWN_MS`), para toques repetidos não virarem "metralhadora".

### 3.5 Falhas

Se um arquivo não carregar, o serviço registra um aviso (só em modo dev) e
segue sem aquele som. Se a biblioteca nativa não estiver disponível, o app usa o
`SilentAudioDriver` e funciona normalmente, só que sem som.

---

## 4. API do `audioService`

| Método | O que faz |
| --- | --- |
| `init()` | Prepara o driver e pré-carrega os efeitos. |
| `playBackgroundMusic(faixa?)` | Toca a faixa em loop (padrão: `main_theme`). |
| `stopBackgroundMusic()` | Para a música. |
| `pauseBackgroundMusic()` / `resumeBackgroundMusic()` | Pausa / retoma. |
| `playSoundEffect(efeito)` | Toca um efeito. |
| `setMasterVolume(v)` | Volume geral (0–1). |
| `setBackgroundMusicVolume(v)` | Volume da música (0–1). |
| `setSoundEffectVolume(v)` | Volume dos efeitos (0–1). |
| `setMuted(bool)` / `toggleMute()` | Liga/desliga o som. |
| `getSettings()` | Configurações atuais. |
| `subscribe(fn)` | Avisa `fn` quando as configurações mudam; retorna a função para cancelar. |
| `attachAppStateHandling()` | Ativa a pausa automática em 2º plano; retorna a função para desativar. |
| `release()` | Libera todos os sons da memória. |

### Hooks (`src/services/audio/hooks.ts`)

| Hook | Uso |
| --- | --- |
| `useAudioSettings()` | Lê volumes/mute e re-renderiza quando mudam. |
| `useBackgroundMusic(faixa \| null)` | Define a música da tela (`null` para parar). |
| `useSoundEffectOnMount(efeito, atrasoMs?)` | Toca um efeito ao abrir a tela. |
| `useSoundHandler()` | Retorna `withSound(handler, efeito?)`, que toca um som (clique por padrão) antes de executar o handler. |

Exemplo:

```tsx
const withSound = useSoundHandler();
useBackgroundMusic('investigation');

<TouchableOpacity onPress={withSound(handleAdvance)} />
<TouchableOpacity onPress={withSound(() => handleAccuse(s), 'accusation')} />
```

---

## 5. Sons disponíveis e como trocá-los

Todos os arquivos atuais são **placeholders** gerados por
`scripts/generate-placeholder-sounds.py` (Python puro, sem dependências).

| Chave | Arquivo | Onde toca |
| --- | --- | --- |
| `button_click` | `button_click.wav` | Todos os botões |
| `new_case` | `new_case.wav` | Abertura do briefing |
| `accusation` | `accusation.wav` | Botão "Acusar" |
| `victory` | `victory.wav` | Resultado — vitória |
| `defeat` | `defeat.wav` | Resultado — derrota |
| `main_theme` | `music_main_theme.wav` | Menu inicial (loop) |
| `investigation` | `music_investigation.wav` | Briefing em diante (loop) |

**Trocar um som:**

1. Mesmo nome → substitua o arquivo em `src/assets/sounds/` e rode o app
   (use `npm start -- --reset-cache` se o Metro mantiver o antigo).
2. Nome ou formato diferente (ex.: `.mp3`) → coloque o arquivo na pasta e troque
   o `require(...)` em `soundAssets.ts`.
3. Nomes de arquivo: só letras minúsculas, números e `_` (exigência do Android).
4. Para músicas prefira `.mp3`/`.ogg` — `.wav` ocupa bem mais espaço.

**Criar um efeito novo:**

1. Adicione o nome em `SoundEffectType` (`src/types/media.services.types.ts`).
2. Adicione a entrada em `SOUND_EFFECTS` (`soundAssets.ts`) — o TypeScript
   acusa erro enquanto ela faltar.
3. Use `audioService.playSoundEffect('novo_efeito')`.

**Criar uma música nova:** mesmo processo, com `MusicTrackType`
(`src/types/audio.services.types.ts`) e `MUSIC_TRACKS`.

**Trocar de biblioteca de áudio:** crie um novo driver que implemente
`AudioDriver` e use-o em `audioServiceInstance.ts`. Nenhum outro arquivo muda.

---

## 6. Mudanças fora de `src/services/`

### `App.tsx`
- Chama `audioService.init()` ao abrir o app (pré-carrega os efeitos).
- Ativa `attachAppStateHandling()` (pausa a música em 2º plano).
- Na desmontagem, desativa o listener e chama `audioService.release()`.
- A música **não** é iniciada aqui — cada tela define a sua.

### `package.json`
- Nova dependência: `"react-native-sound": "^0.13.0"`.
- O `package-lock.json` é atualizado ao rodar `npm install`.

### `src/types/audio.services.types.ts` (novo)
- Tipos `MusicTrackType`, `AudioSettings`, `AudioSettingsListener` e a
  interface `IAudioService`.

### `src/components/AudioSettingsPanel.tsx` (novo)
- Painel usado na tela de configurações:
  - botão **Som ligado / Som desligado** (mute);
  - linhas **Volume geral**, **Música** e **Efeitos** com botões − / + (passos
    de 10%) e o valor em porcentagem.
- Com mute ligado, as linhas de volume ficam esmaecidas.
- Usa botões em vez de slider porque o projeto não tem biblioteca de slider.

### Telas (`src/screens/`)

| Tela | Alteração |
| --- | --- |
| `HomeScreen` | Toca `main_theme`; clique nos botões Jogar, Configurações e Sair. |
| `SettingsScreen` | Inclui o `AudioSettingsPanel`; clique em Voltar e Salvar; o conteúdo passou a ficar em `ScrollView` (em paisagem não cabia mais). |
| `BriefingScreen` | Troca para a música `investigation`; toca `new_case` ao abrir; clique em Avançar. |
| `SuspectsScreen` | Clique em Revisar caso, Interrogar, Histórico e Fechar; **Acusar** toca `accusation`. |
| `InterrogationScreen` | Clique em Voltar. |
| `HistoryScreen` | Clique em Voltar. |
| `ResultScreen` | Para a música; toca `victory` ou `defeat` com 700 ms de atraso (para não sobrepor o som de acusação); clique em Voltar ao início. |

Fluxo da música durante uma partida:

```
Home (main_theme) → Briefing (investigation) → Suspeitos / Interrogatório /
Histórico (investigation continua) → Resultado (silêncio + vitória/derrota)
→ Home (main_theme)
```

As telas de configurações, interrogatório e histórico não definem música:
mantêm a que já estava tocando.

### `src/assets/sounds/` 
- 7 arquivos `.wav` de placeholder (ver seção 5).
- `README.md` com a tabela de sons e instruções de troca.
- O `.gitkeep` foi removido, pois a pasta agora tem conteúdo.

### `scripts/generate-placeholder-sounds.py` (novo)
- Gera os placeholders: `python scripts/generate-placeholder-sounds.py`.
- As notas, durações e volumes podem ser ajustados no próprio script.

### Testes
- `__tests__/AudioService.test.ts` (novo): 6 testes do serviço com um driver
  falso — pré-carregamento, cálculo de volume, mute, loop e troca de faixa,
  pausa/retomada, limites de volume e inscrições.
- `__mocks__/react-native-sound.js` (novo): mock da biblioteca para o Jest, já
  que o módulo nativo não existe no ambiente de testes.

---

## 7. Limitações conhecidas

- As configurações de áudio ficam só na memória: voltam ao padrão quando o app
  reinicia (o projeto ainda não tem AsyncStorage/MMKV, mesma situação da chave
  de API).
- Os sons são placeholders sintéticos e devem ser substituídos.
- Depois de instalar a dependência, rode `npm test` e teste no emulador ou
  aparelho, e `npx prettier --write src` para alinhar a formatação.
