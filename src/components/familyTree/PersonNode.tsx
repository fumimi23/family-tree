import React from 'react';

import { type PersonNodeLayout } from '@/components/familyTree/types';
import { useFamilyTreeTheme } from '@/components/familyTree/useFamilyTreeTheme';
import { type Person, Sex } from '@/schemas/personSchema';

interface Props {
  node: PersonNodeLayout;
  onClick?: (personId: string) => void;
  person: Person;
}

/*
 * 旧姓を併記する場合は、他の行が下に押し下げられる。旧姓なしの通常レイアウトは
 * 既存の比率を維持する (下の Y_RATIO_*_DEFAULT)。
 */
const Y_RATIO_NAME_DEFAULT = 0.29;
const Y_RATIO_DATE_DEFAULT = 0.55;
const Y_RATIO_POSTHUMOUS_DEFAULT = 0.79;
const Y_RATIO_MAIDEN_SHIFTED = 0.22;
const Y_RATIO_NAME_SHIFTED = 0.46;
const Y_RATIO_DATE_SHIFTED = 0.68;
const Y_RATIO_POSTHUMOUS_SHIFTED = 0.88;
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

export function PersonNode({ node, onClick, person }: Props): React.ReactNode {
  const theme = useFamilyTreeTheme();
  const fill = theme.sexFill[toSex(person.sex)];
  const fullName = node.showFamilyName
    ? `${person.familyName} ${person.givenName}`
    : person.givenName;
  const dateText = buildDateText(person.birth, person.death);
  const posthumousName = (person.posthumousName ?? '').trim();
  const maidenName = (person.maidenName ?? '').trim();

  /*
   * 旧姓は姓を表示している場合のみ併記する (showFamilyName=false は姓を隠す指示なので
   * 旧姓も出さない方が一貫する)。
   */
  const showMaidenName = node.showFamilyName && maidenName !== '';
  const isDeceased = person.death !== '';
  const rectOpacity = isDeceased ? DECEASED_RECT_OPACITY : 1;
  const textOpacity = isDeceased ? DECEASED_TEXT_OPACITY : 1;
  const transform = `translate(${node.x.toString()}, ${node.y.toString()})`;
  const centerX = node.width / 2;
  const maidenY = node.height * Y_RATIO_MAIDEN_SHIFTED;
  const nameY = node.height * (showMaidenName ? Y_RATIO_NAME_SHIFTED : Y_RATIO_NAME_DEFAULT);
  const dateY = node.height * (showMaidenName ? Y_RATIO_DATE_SHIFTED : Y_RATIO_DATE_DEFAULT);
  const posthumousY = node.height * (showMaidenName ? Y_RATIO_POSTHUMOUS_SHIFTED : Y_RATIO_POSTHUMOUS_DEFAULT);
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
  return (
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

      {showMaidenName
        ? (
          <text
            fill={theme.dateFill}
            fillOpacity={textOpacity}
            fontSize={10}
            textAnchor="middle"
            x={centerX}
            y={maidenY}
          >
            {`(旧姓 ${maidenName})`}
          </text>
        )
        : null}

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

      {dateText === ''
        ? null
        : (
          <text
            fill={theme.dateFill}
            fillOpacity={textOpacity}
            fontSize={11}
            textAnchor="middle"
            x={centerX}
            y={dateY}
          >
            {dateText}
          </text>
        )}

      {posthumousName === ''
        ? null
        : (
          <text
            fill={theme.dateFill}
            fillOpacity={textOpacity}
            fontSize={10}
            textAnchor="middle"
            x={centerX}
            y={posthumousY}
          >
            {posthumousName}
          </text>
        )}
    </g>
  );
}
