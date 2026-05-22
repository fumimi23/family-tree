import { useColorMode } from '@/components/ui/color-mode';
import { Sex } from '@/schemas/personSchema';

export interface FamilyTreeTheme {
  lineStroke: string;
  nodeStroke: string;
  nameFill: string;
  dateFill: string;
  sexFill: Record<string, string>;
}

const LIGHT_THEME: FamilyTreeTheme = {
  lineStroke: '#334155',
  nodeStroke: '#475569',
  nameFill: '#0f172a',
  dateFill: '#475569',
  sexFill: {
    [Sex.MALE]: '#dbeafe',
    [Sex.FEMALE]: '#fce7f3',
    [Sex.OTHER]: '#fef3c7',
    [Sex.UNKNOWN]: '#f1f5f9',
  },
};

const DARK_THEME: FamilyTreeTheme = {
  lineStroke: '#cbd5e1',
  nodeStroke: '#94a3b8',
  nameFill: '#f8fafc',
  dateFill: '#cbd5e1',
  sexFill: {
    [Sex.MALE]: '#1e3a8a',
    [Sex.FEMALE]: '#831843',
    [Sex.OTHER]: '#78350f',
    [Sex.UNKNOWN]: '#1e293b',
  },
};

export function useFamilyTreeTheme(): FamilyTreeTheme {
  const { colorMode } = useColorMode();
  return colorMode === 'dark' ? DARK_THEME : LIGHT_THEME;
}
