import { reatomComponent } from '@reatom/react';
import { HStack } from 'styled-system/jsx';
import type { ChatMessageModel } from '~/entities/chat';
import { IconButton, Tooltip } from '~/shared/ui/kit/components';
import { CheckIcon, CopyIcon, GitMergeIcon, RefreshCcwIcon, Trash2Icon } from 'lucide-react';
import { Clipboard } from '@ark-ui/react';
import { css } from 'styled-system/css';

export const MessageActionsPanel = reatomComponent(({ model }: { model: ChatMessageModel }) => {
	return (
		<HStack
			gap='0.25rem'
			transition='200ms opacity'
			opacity='0'
			_groupHover={{ opacity: '1' }}
		>
			<Tooltip.Composed label='Branch off'>
				<IconButton variant='ghost' size='xs'>
					<GitMergeIcon />
				</IconButton>
			</Tooltip.Composed>

			<Tooltip.Composed label='Copy message'>
				<Clipboard.Root
					className='group'
					value={model.content()?.text()?.toString() ?? ''}
				>
					<Clipboard.Trigger asChild>
						<IconButton variant='ghost' size='xs'>
							<CopyIcon
								className={css({
									opacity: '1',
									_groupCopied: { opacity: '0' },
									transition: '100ms opacity',
								})}
							/>
							<CheckIcon
								className={css({
									position: 'absolute',
									opacity: '0',
									_groupCopied: { opacity: '1' },
									transition: '100ms opacity',
								})}
							/>
						</IconButton>
					</Clipboard.Trigger>
				</Clipboard.Root>
			</Tooltip.Composed>

			<Tooltip.Composed label='Retry message'>
				<IconButton variant='ghost' size='xs'>
					<RefreshCcwIcon />
				</IconButton>
			</Tooltip.Composed>

			<Tooltip.Composed label='Delete message'>
				<IconButton variant='ghost' size='xs'>
					<Trash2Icon />
				</IconButton>
			</Tooltip.Composed>
		</HStack>
	);
});
