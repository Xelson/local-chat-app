import { noop, reatomField, reatomForm, wrap } from '@reatom/core';
import { reatomComponent, reatomFactoryComponent } from '@reatom/react';
import { VStack, styled } from 'styled-system/jsx';
import { Heading, Text, Button, IconButton, Field, TextField } from '~/shared/ui/kit/components';
import { overlayPage } from '../../model/auth';
import { ArrowLeftIcon } from 'lucide-react';
import { jazzContext } from '~/entities/account';
import { z } from 'zod';
import { useFormField } from '~/shared/ui/reatom';

export const SignInContent = reatomComponent(() => {
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
				<Heading size='4xl'>Sign In</Heading>
				<Text color='fg.muted'>
					Please enter your passphrase for authentication
				</Text>
			</VStack>

			<Form />
		</VStack>
	);
});

const form = reatomForm(name => ({
	passphrase: reatomField('', {
		name: `${name}.passphrase`,
		validate: z.string()
			.refine(
				words => words.trim().split(' ').every(word => jazzContext().wordsListSet.has(word)),
				'Invalid word in the phrase',
			)
			.refine(words => words.split(' ').length == 24, 'Phrase must contain 24 words'),
	}),
}), {
	name: 'signInForm',
	validateOnBlur: true,
	keepErrorOnChange: false,
	onSubmit: async ({ passphrase }) => {
		await wrap(jazzContext().passphraseAuth.logIn(passphrase));
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
				<PassphraseField />

				<SubmitButton />
				<SubmitError />
			</styled.form>
		);
	};
});

const PassphraseField = reatomComponent(() => {
	const { value, setValue, getFieldProps, errors } = useFormField(form.fields.passphrase);

	return (
		<Field.Root invalid={errors.length > 0} required>
			<Field.Label>
				Your passphrase
			</Field.Label>

			<TextField.Root
				width='full'
				value={value}
				onValueChange={setValue}
			>
				<TextField.Textarea
					height='6rem'
					resize='none'
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
			marginTop='0.5rem'
			disabled={disabled}
		>
			Sign In
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
