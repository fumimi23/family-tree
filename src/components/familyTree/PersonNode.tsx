import { Box, Portal, Tooltip } from '@chakra-ui/react';
import React from 'react';

import { type PersonNodeLayout } from '@/components/familyTree/types';
import { useFamilyTreeTheme } from '@/components/familyTree/useFamilyTreeTheme';
import { type Person, Sex, sexList } from '@/schemas/personSchema';

interface Props {
  node: PersonNodeLayout;
  onClick?: (personId: string) => void;
  person: Person;
}

const NAME_Y_RATIO = 0.55;
const DECEASED_RECT_OPACITY = 0.45;
const DECEASED_TEXT_OPACITY = 0.75;

function yearOf(date: string): string {
  return date === '' ? '' : date.slice(0, 4);
}

function toSex(value: string): Sex {
  if (value === Sex.MALE || value === Sex.FEMALE || value === Sex.OTHER) {
    return value;
  }
  return Sex.UNKNOWN;
}

function buildDateText(birth: string, death: string): string {
  const b = yearOf(birth);
  const d = yearOf(death);
  if (b === '' && d === '') {
    return '';
  }
  if (d === '') {
    return `${b} -`;
  }
  if (b === '') {
    return `- ${d}`;
  }
  return `${b} - ${d}`;
}

interface DetailRow {
  label: string;
  value: string;
}

/*
 * 性別はノードの色で既に表現されている。tooltip では情報の重複を避けつつ、
 * 他に表示する詳細 (旧姓/生没年/戒名) があるときだけ、ラベル形式で改めて補足する。
 * したがって性別だけでは tooltip を出さない (= rows が空) ようにする。
 */
function buildDetailRows(person: Person): DetailRow[] {
  const rows: DetailRow[] = [];
  const maiden = (person.maidenName ?? '').trim();
  if (maiden !== '') {
    rows.push({
      label: '旧姓',
      value: maiden,
    });
  }
  const dateText = buildDateText(person.birth, person.death);
  if (dateText !== '') {
    rows.push({
      label: '生没年',
      value: dateText,
    });
  }
  const posthumousName = (person.posthumousName ?? '').trim();
  if (posthumousName !== '') {
    rows.push({
      label: '戒名',
      value: posthumousName,
    });
  }
  if (rows.length === 0) {
    return rows;
  }
  const sexLabel = sexList.find((s) => s.value === toSex(person.sex))?.label;
  if (sexLabel !== undefined) {
    // 性別は旧姓の直後に挿入する (元の並び順を維持)。
    rows.splice(maiden === '' ? 0 : 1, 0, {
      label: '性別',
      value: sexLabel,
    });
  }
  return rows;
}

export function PersonNode({ node, onClick, person }: Props): React.ReactNode {
  const theme = useFamilyTreeTheme();
  const fill = theme.sexFill[toSex(person.sex)];
  const fullName = node.showFamilyName
    ? `${person.familyName} ${person.givenName}`
    : person.givenName;
  const isDeceased = person.death !== '';
  const rectOpacity = isDeceased ? DECEASED_RECT_OPACITY : 1;
  const textOpacity = isDeceased ? DECEASED_TEXT_OPACITY : 1;
  const transform = `translate(${node.x.toString()}, ${node.y.toString()})`;
  const centerX = node.width / 2;
  const nameY = node.height * NAME_Y_RATIO;
  const isClickable = onClick !== undefined;
  const handleClick = !isClickable
    ? undefined
    : (): void => { onClick(person.id); };
  const handleKeyDown = !isClickable
    ? undefined
    : (e: React.KeyboardEvent<SVGGElement>): void => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(person.id);
      }
    };
  const ariaLabel = `${person.familyName} ${person.givenName}`;
  const detailRows = buildDetailRows(person);

  const node$ = (
    <g
      aria-label={isClickable ? ariaLabel : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      style={isClickable ? { cursor: 'pointer' } : undefined}
      tabIndex={isClickable ? 0 : undefined}
      transform={transform}
    >
      <rect
        fill={fill}
        fillOpacity={rectOpacity}
        height={node.height}
        rx={4}
        stroke={theme.nodeStroke}
        strokeOpacity={rectOpacity}
        strokeWidth={1}
        width={node.width}
      />

      <text
        fill={theme.nameFill}
        fillOpacity={textOpacity}
        fontSize={14}
        fontWeight={600}
        textAnchor="middle"
        x={centerX}
        y={nameY}
      >
        {fullName}
      </text>
    </g>
  );

  if (detailRows.length === 0) {
    return node$;
  }

  return (
    <Tooltip.Root openDelay={150}>
      <Tooltip.Trigger asChild>
        {node$}
      </Tooltip.Trigger>

      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content>
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>

            <Box minWidth="180px">
              <Box
                fontWeight={600}
                marginBottom={1}
              >
                {`${person.familyName} ${person.givenName}`}
              </Box>

              {detailRows.map((row) => (
                <Box
                  display="flex"
                  fontSize="xs"
                  gap={2}
                  justifyContent="space-between"
                  key={row.label}
                >
                  <Box color="fg.muted">{row.label}</Box>
                  <Box>{row.value}</Box>
                </Box>
              ))}
            </Box>
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
