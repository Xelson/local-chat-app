import { Portal } from '@ark-ui/react';
import { reatomComponent } from '@reatom/react';
import { type PropsWithChildren, useRef } from 'react';
import type { ChatModel } from '~/entities/chat';
import { Button, Text, Kbd } from '~/shared/ui/kit/components';
import { Dialog } from '~/shared/ui/kit/components';

interface DeleteConfirmationDialogProps extends PropsWithChildren {
	model?: ChatModel;
	onConfirm?: () => void;
}
export const DeleteConfirmationDialog = reatomComponent(({ model, children, onConfirm }: DeleteConfirmationDialogProps) => {
	const clickedConfirmRef = useRef(false);

	return (
		<Dialog.Root
			unmountOnExit
			lazyMount
			onExitComplete={() => {
				if (clickedConfirmRef.current) {
					onConfirm?.();
					clickedConfirmRef.current = false;
				}
			}}
		>
			{children}

			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Dialog.Title>Are you sure you want to delete this?</Dialog.Title>
						<Dialog.Description>
							Chat <b>{model?.name()}</b> will be permanently deleted
						</Dialog.Description>

						<Dialog.CloseButton />

						<Dialog.Footer>
							<Dialog.CloseTrigger asChild>
								<Button variant='outline' width='full'>
									Cancel
								</Button>
							</Dialog.CloseTrigger>

							<Dialog.CloseTrigger asChild>
								<Button
									colorPalette='red'
									width='full'
									onClick={() => clickedConfirmRef.current = true}
								>
									Confirm
								</Button>
							</Dialog.CloseTrigger>
						</Dialog.Footer>

						<Text color='fg.muted' textStyle='xs' textAlign='end' w='full'>
							<Kbd size='sm' px='2'>SHIFT</Kbd> to skip this
						</Text>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
});
