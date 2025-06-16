import { Center, HStack, VStack } from 'styled-system/jsx';
import { Sidebar } from '~/widgets/nav-sidebar';
import { top } from '@reatom/core';
import { editorFormVariable, reatomEditorForm } from '../model/editor-form';
import { reatomContext, reatomFactoryComponent } from '@reatom/react';
import { Group } from 'jazz-tools';
import { MessagesStream } from './MessagesStream';
import { sidebarRoute } from '~/widgets/nav-sidebar/model/route';
import { InputPanel } from './InputPanel';

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
						// sidebarRoute.go();
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
