import { createListCollection } from "@ark-ui/react";
import { ChevronsUpDownIcon } from "lucide-react";
import { Select } from "~/shared/ui/kit/components";

const collection = createListCollection({
	items: [
		{ label: 'Gemini 2.5 Flash', value: 'gemini-flash' },
		{ label: 'Claude 4', value: 'claude4' },
	]
})

export function ModelSelect() {
	return (
		<Select.Root 
			variant='subtle'
			collection={collection} 
			defaultValue={['gemini-flash']}
			positioning={{ sameWidth: true }}
		>
			<Select.Control>
				<Select.Trigger minWidth='12rem'>
					<Select.ValueText placeholder="Select a model" />
					<ChevronsUpDownIcon />
				</Select.Trigger>
			</Select.Control>
			<Select.Positioner>
				<Select.Content>
					<Select.ItemGroup>
						<Select.ItemGroupLabel>Stable models</Select.ItemGroupLabel>
						{collection.items.map((item) => (
							<Select.Item key={item.value} item={item}>
								<Select.ItemText>{item.label}</Select.ItemText>
							</Select.Item>
						))}
					</Select.ItemGroup>
				</Select.Content>
			</Select.Positioner>
		</Select.Root>
	);
}
