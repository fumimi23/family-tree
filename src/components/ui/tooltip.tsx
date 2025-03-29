import { Tooltip as ChakraTooltip, Portal } from '@chakra-ui/react';
import React from 'react';

export interface TooltipProps extends ChakraTooltip.RootProps {
  showArrow?: boolean;
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
  content: React.ReactNode;
  contentProps?: ChakraTooltip.ContentProps;
  disabled?: boolean;
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      showArrow,
      children,
      disabled,
      portalled = true,
      content,
      contentProps,
      portalRef,
      ...rest
    } = props;

    if (disabled !== undefined && disabled) {
      return children;
    }

    return (
      <ChakraTooltip.Root {...rest}>
        <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>

        <Portal
          container={portalRef}
          disabled={!portalled}
        >
          <ChakraTooltip.Positioner>
            <ChakraTooltip.Content
              ref={ref}
              {...contentProps}
            >
              {showArrow !== undefined && showArrow
                ? (
                  <ChakraTooltip.Arrow>
                    <ChakraTooltip.ArrowTip />
                  </ChakraTooltip.Arrow>
                )
                : null}

              {content}
            </ChakraTooltip.Content>
          </ChakraTooltip.Positioner>
        </Portal>
      </ChakraTooltip.Root>
    );
  },
);
