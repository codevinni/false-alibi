// Limites das faixas etárias usadas para escolher o avatar de um suspeito.
//   idade <= YOUNG_MAX_AGE            → 'jovem'
//   idade <= ADULT_MAX_AGE            → 'adulto'
//   acima disso                       → 'idoso'
export const YOUNG_MAX_AGE = 29;
export const ADULT_MAX_AGE = 54;

// Escurecimento padrão aplicado sobre imagens de fundo (0 = nenhum, 1 = preto)
// para o texto continuar legível.
export const DEFAULT_BACKGROUND_OVERLAY = 0.35;
