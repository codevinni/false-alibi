/* Números pseudoaleatórios estáveis: a mesma semente sempre dá o mesmo valor */

// Espalha os bits do hash para gerar valores mais aleatórios, mas ainda estáveis
function mix(hash: number): number {
  let h = hash;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

// Hash estável de uma string 
export function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33 + value.charCodeAt(i)) >>> 0;
  }
  return mix(hash);
}

// Valor estável entre -1 e 1 derivado da semente
export function signedNoise(seed: string): number {
  return (hashString(seed) / 0xffffffff) * 2 - 1;
}
