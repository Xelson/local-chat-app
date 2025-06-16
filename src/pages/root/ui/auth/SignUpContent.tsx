import { noop, reatomField, reatomForm, wrap } from '@reatom/core';
import { reatomComponent, reatomFactoryComponent } from '@reatom/react';
import { VStack, styled } from 'styled-system/jsx';
import { Heading, Text, Button, IconButton, Field, TextField } from '~/shared/ui/kit/components';
import { overlayPage } from '../../model/auth';
import { ArrowLeftIcon } from 'lucide-react';
import { account, currentPassphrase, jazzContext } from '~/entities/account';
import { z } from 'zod';
import { useFormField } from '~/shared/ui/reatom';

export const SignUpContent = reatomComponent(() => {
	const openMain = wrap(() => overlayPage.setMain());

	return (
		<VStack gap='6' maxW='23rem'>
			<IconButton
				variant='subtle'
				size='lg'
				alignSelf='start'
				onClick={openMain}
			>
				<ArrowLeftIcon />
			</IconButton>

			<VStack gap='3' textAlign='center'>
				<Heading size='4xl'>Sign Up</Heading>
				<Text color='fg.muted'>
					Let's register so that we don't lose the chat data.
					Write down this pass phrase somewhere - now it's like a password for you.
				</Text>
			</VStack>

			<Form />
		</VStack>
	);
});

const form = reatomForm(name => ({
	apiKey: reatomField('', {
		name: `${name}.apiKey`,
		validate: z.string()
			.min(6, 'API key is too short')
			.startsWith('sk-', 'Not valid API key'),
	}),
}), {
	name: 'signUpForm',
	validateOnBlur: true,
	keepErrorOnChange: false,
	onSubmit: async ({ apiKey }) => {
		await wrap(jazzContext.passphraseAuth.signUp());

		const root = account()?.root;
		if (root)
			root.openrouterApiKey = apiKey;
	},
});

const Form = reatomFactoryComponent(() => {
	form.reset();

	return () => {
		return (
			<styled.form
				display='flex'
				flexDir='column'
				width='full'
				gap='5'
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();

					form.submit().catch(noop);
				}}
			>
				<Field.Root>
					<Field.Label>Your passphrase</Field.Label>

					<TextField.Root
						width='full'
						value={currentPassphrase()}
					>
						<TextField.Textarea
							height='6rem'
							readOnly
							resize='none'
						/>
					</TextField.Root>

					<Field.ErrorText />
				</Field.Root>

				<ApiKeyField />

				<SubmitButton />
				<SubmitError />
			</styled.form>
		);
	};
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
			size='lg'
			onClick={close}
			marginTop='0.5rem'
			disabled={disabled}
		>
			Sign Up
		</Button>
	);
});

const SubmitError = reatomComponent(() => {
	const error = form.submit.error();

	if (!error)
		return null;

	return (
		<Text color='fg.error' textAlign='center'>
			{error.message}
		</Text>
	);
});
