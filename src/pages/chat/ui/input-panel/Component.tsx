import { Divider, HStack, VStack } from 'styled-system/jsx';
import { FileUpload, IconButton, Spinner, TextField } from '~/shared/ui/kit/components';
import { sidebarChatRoute } from '~/widgets/nav-sidebar';
import { ModelSelect } from '../ModelSelect';
import { ArrowUpIcon } from 'lucide-react';
import { peek, wrap } from '@reatom/core';
import { editorFormVariable } from '../../model/editor-form';
import { reatomComponent } from '@reatom/react';
import { useFormField } from '~/shared/ui/reatom';
import { Collapsible } from '~/shared/ui/kit/components/collapsible';
import { useFileUploadContext } from '@ark-ui/react';
import { mergeRefs } from '~/shared/ui/react';
import { useEffect, useRef } from 'react';

import {
	InputPanelAttachmentItems,
	InputPanelAttachmentsButton,
	InputPanelAttachmentsFileUpload,
	OpenWithAttachmentsCollapsible,
} from './FileUploader';

export const InputPanel = reatomComponent(() => {
	const model = editorFormVariable.get();
	const stickToBottom = model.fields.content.focus().dirty || sidebarChatRoute.exact();

	return (
		<OpenWithAttachmentsCollapsible asChild>
			<InputPanelAttachmentsFileUpload asChild>
				<VStack
					position='absolute'
					zIndex='1'
					left='-1rem'
					right='-1rem'
					width='calc(100% + 2rem)'
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
					<Collapsible.Content overflowX='auto'>
						<InputPanelAttachmentItems />
					</Collapsible.Content>

					<InputPanelConentInput />

					<Divider maskImage='radial-gradient(#000 20%, #0000 70%)' />

					<HStack width='full' justifyContent='space-between'>
						<HStack gap='0.5rem' width='full'>
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

const InputPanelConentInput = reatomComponent(() => {
	const uploader = useFileUploadContext();
	const model = editorFormVariable.get();
	const { value, setValue, getFieldProps } = useFormField(model.fields.content);
	const latestSelectionStartRef = useRef(NaN);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const finalRef = mergeRefs(inputRef, getFieldProps().ref);

	useEffect(() => {
		const selectionStart = latestSelectionStartRef.current;
		if (!isNaN(selectionStart))
			inputRef.current?.setSelectionRange(selectionStart, selectionStart);
	}, [value]);

	return (
		<TextField.Root
			className='group'
			variant='unstyled'
			padding='0'
			width='full'
			value={value}
			onValueChange={setValue}
		>
			<TextField.Textarea
				autoresize
				placeholder='Type your message here...'
				maxHeight='50vh'
				{...getFieldProps()}
				ref={finalRef}
				onChange={(e) => {
					latestSelectionStartRef.current = e.target.selectionStart;
					console.log({ selectionStart: e.target.selectionStart });
				}}
				onKeyDown={(e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						model.submit();
					}
				}}
				onPaste={(e) => {
					if (e.clipboardData?.files && peek(model.supportedInputModalities.files))
						uploader.setFiles([...uploader.acceptedFiles, ...Array.from(e.clipboardData.files)]);
				}}
			/>
		</TextField.Root>
	);
});

const InputPanelSubmitButton = reatomComponent(() => {
	const model = editorFormVariable.get();
	const pending = model.submitPending();
	const disabled = model.submitDisabled();
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
