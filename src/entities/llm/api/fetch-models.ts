import { abortVar } from '@reatom/core';
import { err, ok } from '~/shared/lib/neverthrow';

type Modality = 'text' | 'file' | 'image';

type Response = {
	id: string;
	name: string;
	description: string;
	context_length: number;
	architecture: {
		input_modalities: Modality[];
		output_modalities: Modality[];
	};
	pricing: {
		prompt: string;
		completion: string;
		request: string;
		image: string;
		web_search: string;
		internal_reasoning: string;
	};
}[];

export const fetchModels = async () => {
	const response = await fetch('https://openrouter.ai/api/v1/models', abortVar.getController());
	if (!response.ok)
		return err('unknownError');

	const data = await response.json();

	return ok<Response>(data.data);
};
