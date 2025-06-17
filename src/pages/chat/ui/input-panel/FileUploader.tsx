import { VStack } from 'styled-system/jsx';
import { FileUpload, IconButton, Progress, Text } from '~/shared/ui/kit/components';
import { FileIcon, PaperclipIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { memo } from '@reatom/core';
import { editorFormVariable, type AttachmentModel } from '../../model/editor-form';
import { reatomComponent } from '@reatom/react';
import { match } from 'ts-pattern';
import { css } from 'styled-system/css';
import { Collapsible } from '~/shared/ui/kit/components/collapsible';

export const InputPanelAttachmentsFileUpload = reatomComponent((props: FileUpload.RootProps) => {
	const model = editorFormVariable.get();
	const modalities = model.supportedInputModalities();

	const mimeType = match(modalities)
		.when(type => type?.includes('file'), () => '')
		.when(type => type?.includes('image'), () => 'image/*')
		.otherwise(() => undefined);

	return (
		<FileUpload.Root
			maxFiles={20}
			{...props}
			accept={mimeType}
			onFileAccept={({ files }) => {
				model.fields.attachments.clear();
				files.forEach(file => model.fields.attachments.create(file));
			}}
		/>
	);
});

export const InputPanelAttachmentsButton = reatomComponent(() => {
	const model = editorFormVariable.get();
	if (!model.supportedInputModalities.files())
		return null;

	return (
		<FileUpload.Trigger asChild>
			<IconButton variant='subtle' size='sm'>
				<PaperclipIcon />
			</IconButton>
		</FileUpload.Trigger>
	);
});

export const InputPanelAttachmentItems = reatomComponent(() => {
	const model = editorFormVariable.get();
	const attachments = model.attachmentModels();

	return (
		<FileUpload.ItemGroup flexDir='row' mb='0.5rem'>
			{attachments.map(model => (
				<AttachmentUploadItem
					key={model.name}
					model={model}
				/>
			))}

			<FileUpload.Dropzone
				size='8rem'
				minH='0'
				cursor='pointer'
				border='default'
				borderStyle='dashed'
				color='colorPalette.9'
				borderColor='colorPalette.7'
				backgroundColor='colorPalette.2'
			>
				<VStack pointerEvents='none' gap='0'>
					<PlusIcon size='48' strokeWidth='1' />
					<Text>Add</Text>
				</VStack>
			</FileUpload.Dropzone>
		</FileUpload.ItemGroup>
	);
});

const AttachmentUploadItem = reatomComponent(({ model }: { model: AttachmentModel }) => {
	model.stream(); // subscribing to stream
	const uploaded = memo(() => model.uploadProgress() == 1);

	return (
		<FileUpload.Item
			key={model.name}
			file={model.file}
			opacity={uploaded ? '1' : '0.75'}
			transition='200ms opacity'
		>
			{match(model.file.type)
				.when(type => type.match('image/*'), () => (
					<FileUpload.ItemPreviewImage />
				))
				.otherwise(() => (
					<FileIcon
						className={css({
							size: '4rem',
							marginBottom: 'auto',
							strokeWidth: '1',
							color: 'colorPalette.7',
						})}
					/>
				))}

			<FileUpload.ItemName />
			<FileUpload.ItemSizeText />

			<AttachmentUploadProgress model={model} />

			<FileUpload.ItemDeleteTrigger asChild>
				<IconButton variant='ghost' size='sm' color='gray.9'>
					<Trash2Icon />
				</IconButton>
			</FileUpload.ItemDeleteTrigger>
		</FileUpload.Item>
	);
});

const AttachmentUploadProgress = reatomComponent(({ model }: { model: AttachmentModel }) => {
	const progress = model.uploadProgress();

	return (
		<Progress
			type='circular'
			size='xs'
			showValueText={false}
			value={progress * 100.0}
			position='absolute'
			top='2.75rem'
			right='0.8rem'
			opacity={progress == 1 ? '0' : '1'}
			transition='200ms opacity'
		/>
	);
});

export const OpenWithAttachmentsCollapsible = reatomComponent(({ children }: Collapsible.RootProps) => {
	const model = editorFormVariable.get();
	const attachments = model.attachmentModels();

	return (
		<Collapsible.Root
			open={attachments.length > 0}
			lazyMount
			unmountOnExit
		>
			{children}
		</Collapsible.Root>
	);
});
