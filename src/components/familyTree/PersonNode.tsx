import { type PersonNodeLayout } from '@/components/familyTree/types';
import { useFamilyTreeTheme } from '@/components/familyTree/useFamilyTreeTheme';
import { type Person, Sex } from '@/schemas/personSchema';
import React from 'react';

interface Props {
  node: PersonNodeLayout;
  person: Person;
}

const NAME_Y_RATIO = 0.29;
const DATE_Y_RATIO = 0.55;
const POSTHUMOUS_Y_RATIO = 0.79;
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

export function PersonNode({ node, person }: Props): React.ReactNode {
  const theme = useFamilyTreeTheme();
  const fill = theme.sexFill[toSex(person.sex)];
  const fullName = `${person.familyName} ${person.givenName}`;
  const dateText = buildDateText(person.birth, person.death);
  const posthumousName = (person.posthumousName ?? '').trim();
  const isDeceased = person.death !== '';
  const rectOpacity = isDeceased ? DECEASED_RECT_OPACITY : 1;
  const textOpacity = isDeceased ? DECEASED_TEXT_OPACITY : 1;
  const transform = `translate(${node.x.toString()}, ${node.y.toString()})`;
  const centerX = node.width / 2;
  const nameY = node.height * NAME_Y_RATIO;
  const dateY = node.height * DATE_Y_RATIO;
  const posthumousY = node.height * POSTHUMOUS_Y_RATIO;
  return (
    <g transform={transform}>
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
