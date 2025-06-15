import { Divider, HStack, VStack } from 'styled-system/jsx';
import { FileUpload, IconButton, Progress, Spinner, Text, TextField } from '~/shared/ui/kit/components';
import { sidebarChatRoute } from '~/widgets/nav-sidebar';
import { ModelSelect } from './ModelSelect';
import { ArrowUpIcon, File, PaperclipIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { addCallHook, memo, wrap } from '@reatom/core';
import { editorFormVariable, type AttachmentModel } from '../model/editor-form';
import { reatomComponent } from '@reatom/react';
import { useFormField } from '~/shared/ui/reatom';
import { useEffect, useState } from 'react';
import { Collapsible } from '~/shared/ui/kit/components/collapsible';
import { match } from 'ts-pattern';
import { css } from 'styled-system/css';
import { modelsListQuery } from '~/entities/llm';

export const InputPanel = reatomComponent(() => {
	const model = editorFormVariable.get();
	const stickToBottom = model.fields.content.focus().dirty || sidebarChatRoute.exact();

	return (
		<OpenWithAttachmentsCollapsible asChild>
			<InputPanelAttachmentsFileUpload asChild>
				<VStack
					position='absolute'
					left='-1rem'
					right='-1rem'
					bottom={stickToBottom ? '0' : '50%'}
					translate='auto'
					translateY={stickToBottom ? '0%' : '50%'}
					scale={stickToBottom ? '1' : '1.1'}
					alignItems='start'
					padding='1rem'
					border='default'
					borderColor='border.subtle'
					background='white/50'
					backdropFilter='blur(2rem)'
					borderRadius='l3'
					shadow='sm'
					transition='200ms all ease'
				>
					<Collapsible.Content>
						<InputPanelAttachmentItems />
					</Collapsible.Content>

					<InputPanelConentInput />

					<Divider maskImage='radial-gradient(#000 20%, #0000 70%)' />

					<HStack width='full' justifyContent='space-between'>
						<HStack gap='0.5rem'>
							<ModelSelect />

							<InputPanelAttachmentsButton />
						</HStack>

						<InputPanelSubmitButton />
					</HStack>

					<FileUpload.HiddenInput />
				</VStack>
			</InputPanelAttachmentsFileUpload>
		</OpenWithAttachmentsCollapsible>
	);
});

const InputPanelAttachmentsButton = reatomComponent(() => {
	const model = editorFormVariable.get();
	const modalities = model.supportedInputModalities();

	if (!modalities?.length)
		return null;

	const supportsImages = modalities.includes('image');
	const supportsFiles = modalities.includes('file');
	if (!supportsImages && !supportsFiles)
		return null;

	return (
		<FileUpload.Trigger asChild>
			<IconButton variant='subtle' size='sm'>
				<PaperclipIcon />
			</IconButton>
		</FileUpload.Trigger>
	);
});

const InputPanelConentInput = reatomComponent(() => {
	const model = editorFormVariable.get();
	const { value, setValue, getFieldProps } = useFormField(model.fields.content);
	const [version, setVersion] = useState(0);

	useEffect(() => {
		return addCallHook(model.fields.content.reset, () => setVersion(v => v + 1));
	}, [model.fields.content.reset]);

	return (
		<TextField.Root
			key={version}
			className='group'
			variant='unstyled'
			padding='0'
			width='full'
			defaultValue={value}
			onValueChange={setValue}
		>
			<TextField.Textarea
				autoresize
				placeholder='Type your message here...'
				maxHeight='50vh'
				{...getFieldProps()}
				onKeyDown={(e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						model.submit();
					}
				}}
			/>
		</TextField.Root>
	);
});

const OpenWithAttachmentsCollapsible = reatomComponent(({ children }: Collapsible.RootProps) => {
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

const InputPanelAttachmentsFileUpload = reatomComponent((props: FileUpload.RootProps) => {
	const model = editorFormVariable.get();
	const modalities = model.supportedInputModalities();

	const mimeType = match(modalities)
		.when(type => type?.includes('file'), () => '*')
		.when(type => type?.includes('image'), () => 'image/*')
		.otherwise(() => undefined);

	return (
		<FileUpload.Root
			maxFiles={6}
			{...props}
			accept={mimeType}
			onFileAccept={({ files }) => {
				model.fields.attachments.clear();
				files.forEach(file => model.fields.attachments.create(file));
			}}
		/>
	);
});

const InputPanelAttachmentItems = reatomComponent(() => {
	const model = editorFormVariable.get();
	const attachments = model.attachmentModels();

	return (
		<FileUpload.ItemGroup flexDir='row' flexWrap='wrap' mb='0.5rem'>
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
					<File
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

const InputPanelSubmitButton = reatomComponent(() => {
	const model = editorFormVariable.get();
	const pending = !!model.submit.pending();
	const disabled = !model.focus().dirty || pending;
	const submit = wrap(model.submit);

	return (
		<IconButton
			variant='subtle'
			size='sm'
			disabled={disabled}
			onClick={submit}
		>
			{pending ? <Spinner size='sm' /> : <ArrowUpIcon />}
		</IconButton>
	);
});
