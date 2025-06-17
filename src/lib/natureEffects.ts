import { Natures } from '@/data/sv/natures';

const statLabels: Record<string, string> = {
  hp: 'PS', atk: 'Atk', def: 'Def', spa: 'AtqEsp', spd: 'DefEsp', spe: 'Vel',
};

const statLabelsEn: Record<string, string> = {
  hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe',
};

export function getNatureEffectShort(natureName: string): string {
  const nature = Object.values(Natures).find(n => n.name.toLowerCase() === natureName.toLowerCase());
  if (!nature) return '';
  if (nature.plus && nature.minus && nature.plus !== nature.minus) {
    return `+${statLabels[nature.plus]} -${statLabels[nature.minus]}`;
  }
  return 'Neutral';
}

export function getNatureEffectShortEn(natureName: string): string {
  const nature = Object.values(Natures).find(n => n.name.toLowerCase() === natureName.toLowerCase());
  if (!nature) return '';
  if (nature.plus && nature.minus && nature.plus !== nature.minus) {
    return `+${statLabelsEn[nature.plus]} -${statLabelsEn[nature.minus]}`;
  }
  return 'Neutral';
}

export function getNatureEffectText(natureName: string): string {
  const nature = Object.values(Natures).find(n => n.name.toLowerCase() === natureName.toLowerCase());
  if (!nature) return '';
  if (nature.plus && nature.minus && nature.plus !== nature.minus) {
    return `${nature.name}: incrementa ${statLabels[nature.plus]} y reduce ${statLabels[nature.minus]}`;
  }
  return `${nature.name}: no afecta las estadísticas`;
}
