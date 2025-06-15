import { createListCollection } from '@ark-ui/react';
import { reatomComponent, reatomFactoryComponent } from '@reatom/react';
import { ChevronsUpDownIcon, FileIcon, ImageIcon } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { reatomModelsSelect, type ModelsSelectModel } from '~/entities/llm';
import { Heading, Select, Skeleton, Text, Tooltip } from '~/shared/ui/kit/components';
import { editorFormVariable } from '../model/editor-form';
import { useScrollPagination } from '~/shared/ui/react-dom';
import { HStack } from 'styled-system/jsx';
import { match } from 'ts-pattern';
import { css } from 'styled-system/css';
import { spawn } from '@reatom/core';

export const ModelSelect = reatomFactoryComponent(() => {
	const selectModel = reatomModelsSelect({ limit: 15 }, 'modelsSelect');

	return () => {
		const formModel = editorFormVariable.get();
		const selectedModelId = formModel.fields.modelId.value();
		const results = selectModel.data();

		const collection = useMemo(() => {
			const items = results?.map(item => ({ label: item.name, value: item.id }));
			return createListCollection({ items: items ?? [] });
		}, [results]);

		return (
			<Select.Root
				variant='subtle'
				collection={collection}
				value={[selectedModelId]}
				onValueChange={({ value }) => {
					const selectedId = value[0];
					formModel.fields.modelId.change(selectedId);
					selectModel.selectedModelId.set(selectedId);
				}}
				onExitComplete={() => selectModel.limit.set(15)}
				lazyMount
				unmountOnExit
			>
				<Skeleton loading={!collection}>
					<Select.Control>
						<Select.Trigger minWidth='12rem'>
							<Select.ValueText placeholder='Select a model' />
							<ChevronsUpDownIcon />
						</Select.Trigger>
					</Select.Control>
				</Skeleton>
				<Select.Positioner>
					<SelectContent
						model={selectModel}
					/>
				</Select.Positioner>
			</Select.Root>
		);
	};
});

const contextNumberFormatter = Intl.NumberFormat('en', { notation: 'compact' });
const pricingFormatter = { format: (value: string) => `$${(Number(value) * 1_000_000).toFixed(2)}/M` };

const SelectContent = reatomComponent(({ model: selectModel }: { model: ModelsSelectModel }) => {
	const contentRef = useRef<HTMLDivElement>(null);

	const formModel = editorFormVariable.get();
	const total = selectModel.total();
	const results = selectModel.data();
	const usedModalities = formModel.usedModalities();

	useScrollPagination(contentRef, {
		loading: false,
		shouldObserve: !!total && selectModel.limit() < total,
		onLoadMore: () => spawn(() => selectModel.limit.increment(15)),
	});

	return (
		<Select.Content
			ref={contentRef}
			maxHeight='20rem'
			maxWidth='30rem'
			overflowY='auto'
		>
			<Select.ItemGroup>
				<Select.ItemGroupLabel>Available models</Select.ItemGroupLabel>
				{results?.map(item => (
					<Select.Item
						key={item.id}
						item={{
							label: item.name,
							value: item.id,
							disabled: !!usedModalities.length
								&& !usedModalities.every(m => item.architecture.input_modalities.includes(m)),
						}}
						height='auto'
						alignItems='start'
						flexDirection='column'
						paddingY='0.5rem'
						gap='0.5rem'
					>
						<HStack width='full' justifyContent='space-between' maxWidth='full'>
							<Heading size='lg' truncate maxWidth='full'>
								{item.name}
							</Heading>

							<HStack gap='0.5rem'>
								{item.architecture.input_modalities.map(modality => (
									match(modality)
										.with('image', type => <SupportsImagesBadge key={type} />)
										.with('file', type => <SupportsFilesBadge key={type} />)
										.otherwise(() => null)
								))}
							</HStack>
						</HStack>

						<Text
							color='fg.muted'
							textStyle='sm'
							lineClamp='3'
						>
							{item.description}
						</Text>

						<HStack gap='0.25rem' alignItems='start' color='fg.muted' textStyle='xs'>
							<Text>{contextNumberFormatter.format(item.context_length)} context</Text>
							•
							<Text>{pricingFormatter.format(item.pricing.prompt)} input tokens</Text>
							•
							<Text>{pricingFormatter.format(item.pricing.completion)} output tokens</Text>
						</HStack>
					</Select.Item>
				))}
			</Select.ItemGroup>
		</Select.Content>
	);
});

const iconStyle = css({
	size: '1.25rem',
	color: 'gray.9',
	cursor: 'help',
});

function SupportsImagesBadge() {
	return (
		<Tooltip.Composed
			label='Supports images'
			lazyMount
			unmountOnExit
			openDelay={0}
		>
			<ImageIcon className={iconStyle} />
		</Tooltip.Composed>
	);
}

function SupportsFilesBadge() {
	return (
		<Tooltip.Composed
			label='Supports files'
			lazyMount
			unmountOnExit
			openDelay={0}
		>
			<FileIcon className={iconStyle} />
		</Tooltip.Composed>
	);
}
