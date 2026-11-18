# Identidade visual — ícones

Monograma **FA** na fonte **Alfa Slab One** (Google Fonts, licença OFL), a
mesma família de letra pesada com serifa do título "FALSE ALIBI":
"F" creme (`#DED4C4`), "A" vermelho (`#9E1C26`), fundo quase preto
(`#0C0A09`) com vinheta, textura de carimbo gasto e o traço vermelho
inclinado do título. Abaixo de 64 px a textura e o traço saem, para o
ícone continuar legível.

| Arquivo | Uso |
| --- | --- |
| `favicon.ico` | favicon com 16, 32 e 48 px |
| `favicon-16.png`, `favicon-32.png` | favicon em PNG |
| `apple-touch-icon.png` | 180 px (iOS / atalho na tela inicial) |
| `icon-192.png`, `icon-512.png` | PWA / lojas / divulgação |
| `icon-1024.png` | arquivo mestre |

Os ícones do app Android ficam em
`android/app/src/main/res/mipmap-*/ic_launcher.png` (cantos arredondados) e
`ic_launcher_round.png` (redondo).

Para regenerar após ajustar cores ou fonte:

```bash
python scripts/generate-icons.py --font caminho/AlfaSlabOne-Regular.ttf
```

Uso em uma página web:

```html
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
```
