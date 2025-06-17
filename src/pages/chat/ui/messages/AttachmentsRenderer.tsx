import { reatomMap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { HStack, styled, VStack } from 'styled-system/jsx';
import { memo as reactMemo } from 'react';
import { Skeleton, Text } from '~/shared/ui/kit/components';
import type { ChatMessageModel } from '~/entities/chat';
import type { FileStream } from 'jazz-tools';
import { FileIcon } from 'lucide-react';
import { css } from 'styled-system/css';

export const AttachmentsRenderer = reactMemo(reatomComponent(({ model }: { model: ChatMessageModel }) => {
	const attachments = model.attachments();
	if (!attachments || !attachments.length)
		return null;

	return (
		<VStack alignItems='start' gap='0.25rem'>
			<Text textStyle='sm' fontWeight='medium' userSelect='none'>
				Attachments:
			</Text>

			<HStack>
				{attachments.map(stream => (
					stream ? (
						<AttachmentPreview
							key={stream.id}
							stream={stream}
						/>
					) : (
						<Skeleton
							loading
							size='8rem'
							borderRadius='l2'
						/>
					)
				))}
			</HStack>
		</VStack>
	);
}));

const streamToUrlMap = reatomMap<string, string>(undefined, 'streamToUrlMap');

const fileSizeFormatter = Intl.NumberFormat('en', {
	notation: 'compact',
	style: 'unit',
	unit: 'byte',
	unitDisplay: 'narrow',
});

function AttachmentPreview({ stream }: { stream: FileStream }) {
	const meta = stream.getMetadata();
	const url = streamToUrlMap.getOrCreate(stream.id, () => URL.createObjectURL(stream.toBlob() ?? new Blob()));

	return (
		<VStack
			size='8rem'
			borderRadius='l2'
			border='default'
			padding='0.5rem'
			alignItems='start'
			flexDirection='column'
			justifyContent='space-between'
			background='white.a9'
			gap='0.25rem'
			userSelect='none'
		>
			{meta?.mimeType.startsWith('image/') ? (
				<styled.img
					size='4.5rem'
					borderRadius='l1'
					objectFit='cover'
					src={url}
				/>
			) : (
				<FileIcon
					className={css({
						size: '4.5rem',
						marginBottom: 'auto',
						strokeWidth: '1',
						color: 'colorPalette.7',
					})}
				/>
			)}

			<VStack alignItems='start' gap='0' width='full'>
				<Text truncate maxW='full' textStyle='sm' fontWeight='medium'>
					{meta?.fileName}
				</Text>
				<Text textStyle='xs' color='fg.muted'>
					{fileSizeFormatter.format(meta?.totalSizeBytes ?? 0)}
				</Text>
			</VStack>
		</VStack>
	);
}
