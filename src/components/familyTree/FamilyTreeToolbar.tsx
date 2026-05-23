import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Flex, Text } from '@chakra-ui/react';
import React from 'react';

interface Props {
  onExportPng: () => void;
  onExportSvg: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  zoomPercent: number;
}

export function FamilyTreeToolbar({
  onExportPng,
  onExportSvg,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  zoomPercent,
}: Props): React.ReactNode {
  return (
    <Flex
      alignItems="center"
      gap={2}
    >
      <PrimaryButton
        aria-label="ズームアウト"
        onClick={onZoomOut}
        size="sm"
        title="ズームアウト"
      >
        −
      </PrimaryButton>

      <Text
        fontSize="sm"
        minWidth="50px"
        textAlign="center"
      >
        {`${zoomPercent.toString()}%`}
      </Text>

      <PrimaryButton
        aria-label="ズームイン"
        onClick={onZoomIn}
        size="sm"
        title="ズームイン"
      >
        +
      </PrimaryButton>

      <PrimaryButton
        onClick={onZoomReset}
        size="sm"
      >
        リセット
      </PrimaryButton>

      <PrimaryButton
        onClick={onExportSvg}
        size="sm"
      >
        SVG
      </PrimaryButton>

      <PrimaryButton
        onClick={onExportPng}
        size="sm"
      >
        PNG
      </PrimaryButton>
    </Flex>
  );
}
