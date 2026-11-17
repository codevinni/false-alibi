# Sons do False Alibi

A música principal (`music_main_theme.mp3`) é a trilha definitiva do menu.
Os demais arquivos ainda são **placeholders** gerados por
`scripts/generate-placeholder-sounds.py` (bipes e arpejos simples).

| Arquivo                   | Uso                                   | Chave no código   |
| ------------------------- | ------------------------------------- | ----------------- |
| `button_click.wav`        | toque em qualquer botão               | `button_click`    |
| `new_case.wav`            | abertura do briefing de um caso novo  | `new_case`        |
| `accusation.wav`          | botão "Acusar" na tela de suspeitos   | `accusation`      |
| `victory.wav`             | tela de resultado — vitória           | `victory`         |
| `defeat.wav`              | tela de resultado — derrota           | `defeat`          |
| `music_main_theme.mp3`    | música do menu — faixa padrão (loop)  | `main_theme`      |
| `music_investigation.wav` | música durante a investigação (loop)  | `investigation`   |

## Como trocar um som

- **Mesmo nome:** substitua o arquivo aqui e rode o app de novo
  (`npm start -- --reset-cache` se o Metro mantiver o antigo).
- **Nome/formato diferente** (ex.: `.mp3`): coloque o arquivo aqui e troque o
  `require(...)` em `src/services/audio/soundAssets.ts`.
- Nomes de arquivo: só letras minúsculas, números e `_` (exigência do Android).
- Para músicas, prefira `.mp3`/`.ogg` — `.wav` é bem maior.
- Volume de cada arquivo pode ser ajustado no campo `volume` em `soundAssets.ts`.

## Regenerar os placeholders

```bash
python scripts/generate-placeholder-sounds.py
```
