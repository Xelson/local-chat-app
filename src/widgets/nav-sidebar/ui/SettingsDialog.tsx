import { Portal } from '@ark-ui/react';
import { noop, reatomField, reatomForm, withComputed } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { Settings2Icon } from 'lucide-react';
import { styled } from 'styled-system/jsx';
import { account, openrouterApiKey } from '~/entities/account';
import { Button, Field, TextField } from '~/shared/ui/kit/components';
import { Dialog } from '~/shared/ui/kit/components';
import { useFormField } from '~/shared/ui/reatom';
import { z } from 'zod';

const form = reatomForm(name => ({
	apiKey: reatomField('', {
		name: `${name}.apiKey`,
		validate: z.string()
			.min(6, 'API key is too short')
			.startsWith('sk-', 'Not valid API key'),
	}),
}), {
	name: 'settingsForm',
	validateOnBlur: true,
	keepErrorOnChange: false,
	onSubmit: async ({ apiKey }) => {
		const root = account()?.root;
		if (root)
			root.openrouterApiKey = apiKey;
	},
});

form.fields.apiKey.extend(
	withComputed((state) => {
		const savedApiKey = openrouterApiKey();
		if (savedApiKey) {
			state = savedApiKey;
			form.fields.apiKey.initState.set(state);
		}

		return state;
	}),
);

export const SettingsDialog = reatomComponent(() => {
	return (
		<Dialog.Root
			unmountOnExit
			lazyMount
			onExitComplete={() => form.reset()}
		>
			<Dialog.Trigger asChild>
				<Button variant='subtle' width='full'>
					<Settings2Icon /> Settings
				</Button>
			</Dialog.Trigger>

			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Dialog.Title>Settings</Dialog.Title>

						<Dialog.CloseButton />

						<Dialog.Context>
							{({ setOpen }) => (
								<styled.form
									display='flex'
									flexDir='column'
									width='full'
									gap='5'
									onSubmit={(e) => {
										e.preventDefault();
										e.stopPropagation();

										form.submit()
											.then(() => setOpen(false))
											.catch(noop);
									}}
								>
									<ApiKeyField />

									<SubmitButton />
								</styled.form>
							)}
						</Dialog.Context>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
});

const ApiKeyField = reatomComponent(() => {
	const { value, setValue, getFieldProps, errors } = useFormField(form.fields.apiKey);

	return (
		<Field.Root invalid={errors.length > 0} required>
			<Field.Label>
				OpenRouter API key <Field.RequiredIndicator />
			</Field.Label>

			<TextField.Root
				width='full'
				value={value}
				onValueChange={setValue}
			>
				<TextField.Input
					type='password'
					placeholder='Place it here...'
					{...getFieldProps()}
				/>
			</TextField.Root>

			<Field.ErrorText>{errors[0]?.message}</Field.ErrorText>
		</Field.Root>
	);
});

const SubmitButton = reatomComponent(() => {
	const validation = form.validation();
	const disabled = validation.errors.length > 0;

	return (
		<Button
			width='full'
			marginTop='0.5rem'
			disabled={disabled}
		>
			Save
		</Button>
	);
});
