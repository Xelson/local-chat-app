import { Center, Divider, HStack, VStack } from 'styled-system/jsx';
import { IconButton, Spinner, TextField } from '~/shared/ui/kit/components';
import { Sidebar, sidebarChatRoute } from '~/widgets/nav-sidebar';
import { ModelSelect } from './ModelSelect';
import { ArrowUpIcon, PaperclipIcon } from 'lucide-react';
import { addCallHook, top, wrap } from '@reatom/core';
import { editorFormVariable, reatomEditorForm } from '../model/editor-form';
import { reatomComponent, reatomContext, reatomFactoryComponent } from '@reatom/react';
import { Group } from 'jazz-tools';
import { useFormField } from '~/shared/ui/reatom';
import { MessagesStream } from './MessagesStream';
import { useEffect, useState } from 'react';
import { sidebarRoute } from '~/widgets/nav-sidebar/model/route';

export const Component = reatomFactoryComponent(() => {
	// Here we initialize a reactive model bound to this component's lifecycle. This callback executes only once,
	// and its body is literally wrapped in useMemo - serving as a single initialization point for everything
	// we want to set up once. We're using Reatom's `variable` - an asynchronous variable from the upcoming TC39 proposal
	// https://github.com/tc39/proposal-async-context?tab=readme-ov-file#asynccontextvariable
	// By setting its value here and propagating the current stack frame through reatomContext.Provider, we enable
	// child components to consume this variable's value similarly to React's useContext, but with a simpler API.
	// Reatom also uses this approach to propagate AbortController through reactive chains

	const messageGroup = Group.create();
	const model = reatomEditorForm(messageGroup, 'editorForm');

	const frame = top();
	editorFormVariable.set(model);

	return () => (
		<reatomContext.Provider value={frame}>
			<HStack size='full' gap='1rem'>
				<Sidebar
					onClickAddChat={() => {
						model.fields.content.elementRef()?.focus();
						sidebarRoute.go();
					}}
				/>

				<Center
					size='full'
					alignItems='start'
				>
					<VStack
						size='full'
						position='relative'
						alignItems='start'
						width='full'
						maxWidth='50rem'
						marginX='1rem'
					>
						<MessagesStream />
						<InputPanel />
					</VStack>
				</Center>
			</HStack>
		</reatomContext.Provider>
	);
});

const InputPanel = reatomComponent(() => {
	const model = editorFormVariable.get();
	const stickToBottom = model.focus().dirty || sidebarChatRoute.exact();

	return (
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
			<InputPanelConentInput />

			<Divider maskImage='radial-gradient(#000 20%, #0000 70%)' />

			<HStack width='full' justifyContent='space-between'>
				<HStack gap='0.5rem'>
					<ModelSelect />
					<IconButton variant='subtle' size='sm'>
						<PaperclipIcon />
					</IconButton>
				</HStack>

				<InputPanelSubmitButton />
			</HStack>
		</VStack>
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
			/>
		</TextField.Root>
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
