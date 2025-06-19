import { XIcon } from 'lucide-react';
import { IconButton, Toast } from '../kit/components';

// eslint-disable-next-line react-refresh/only-export-components
export const toaster = Toast.createToaster({
	placement: 'bottom-end',
	overlap: true,
	gap: 16,
});

export const ToastsStream = () => (
	<Toast.Toaster toaster={toaster}>
		{toast => (
			<Toast.Root key={toast.id}>
				<Toast.Title>{toast.title}</Toast.Title>
				<Toast.Description>{toast.description}</Toast.Description>
				<Toast.CloseTrigger asChild>
					<IconButton size='sm' variant='ghost'>
						<XIcon />
					</IconButton>
				</Toast.CloseTrigger>
			</Toast.Root>
		)}
	</Toast.Toaster>
);
