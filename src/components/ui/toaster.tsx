import {
  Toaster as ChakraToaster,
  createToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
} from '@chakra-ui/react';

export const toaster = createToaster({
  placement: 'bottom-end',
  pauseOnPageIdle: true,
});

export function Toaster(): React.ReactNode {
  return (
    <Portal>
      <ChakraToaster
        insetInline={{ mdDown: '4' }}
        toaster={toaster}
      >
        {(toast) => (
          <Toast.Root width={{ md: 'sm' }}>
            {toast.type === 'loading'
              ? (
                <Spinner
                  color="blue.solid"
                  size="sm"
                />
              )
              : (
                <Toast.Indicator />
              )}

            <Stack
              flex="1"
              gap="1"
              maxWidth="100%"
            >
              {toast.title !== undefined ? <Toast.Title>{toast.title}</Toast.Title> : null}
              {toast.description !== undefined ? <Toast.Description>{toast.description}</Toast.Description> : null}
            </Stack>

            {toast.action !== undefined ? <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger> : null}
            {toast.meta?.closable !== undefined && typeof toast.meta.closable === 'boolean' && toast.meta.closable ? <Toast.CloseTrigger /> : null}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  );
}
