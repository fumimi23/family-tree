import { type PersonNodeLayout } from '@/components/familyTree/types';
import { useFamilyTreeTheme } from '@/components/familyTree/useFamilyTreeTheme';
import { type Person, Sex } from '@/schemas/personSchema';
import React from 'react';

interface Props {
  node: PersonNodeLayout;
  person: Person;
}

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
  const transform = `translate(${node.x.toString()}, ${node.y.toString()})`;
  const centerX = node.width / 2;
  const nameY = (node.height / 2) - 4;
  const dateY = (node.height / 2) + 14;
  return (
    <g transform={transform}>
      <rect
        fill={fill}
        height={node.height}
        rx={4}
        stroke={theme.nodeStroke}
        strokeWidth={1}
        width={node.width}
      />

      <text
        fill={theme.nameFill}
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
            fontSize={11}
            textAnchor="middle"
            x={centerX}
            y={dateY}
          >
            {dateText}
          </text>
        )}
    </g>
  );
}
