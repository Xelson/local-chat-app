import { assign, atom, computed, reatomForm, variable, withAsyncData, wrap } from '@reatom/core';
import type { Account, Group } from 'jazz-tools';
import { co } from 'jazz-tools';

export type EditorFormModel = ReturnType<typeof reatomEditorForm>;

export const reatomEditorForm = (owner: Account | Group, name: string) => {
	const form = reatomForm({
		content: '',
		attachments: new Array<File>(),
	}, {
		name,
		validateOnChange: true,
		onSubmit: async ({ content, attachments }) => {

		},
	});

	return assign(form, {
		attachmentModels: computed(() => form.fields.attachments
			.array()
			.map(file => reatomAttachmentModel(file.value(), { owner, name: `${name}.attachmentModels` })),
		),
	});
};

const reatomAttachmentModel = (
	file: File,
	{ name, owner }: { name: string; owner: Account | Group },
) => {
	const uploadProgress = atom(0, `${name}.uploadProgress`);

	const stream = atom(async () => {
		const data = await wrap(
			co.fileStream().createFromBlob(file, {
				owner,
				onProgress: progress => uploadProgress.set(progress),
			}),
		);
		return data;
	}, `${name}.stream`).extend(
		withAsyncData(),
	);

	return {
		stream,
	};
};

export const editorFormVariable = variable<EditorFormModel>('editorForm');
