import { type Editor, Notice, type TFile } from "obsidian";
import type TextEaterPlugin from "../main";
import z from "zod";
import { prompts } from "prompts";

export async function getInfinitiveFromFilename(
	plugin: TextEaterPlugin,
	file: TFile,
) {
	const text = file.basename;
	const res = await getInfinitive(plugin, text)

	await plugin.fileService.writeToOpenedFile(` ${res} \n`);
}

export async function getInfinitiveFromSelection(
	plugin: TextEaterPlugin,
	editor: Editor,
	text: string,
) {
	const res = await getInfinitive(plugin, text)

	await navigator.clipboard.writeText(`${res}`);
	editor.replaceSelection(`${res}`);
}


async function getInfinitive(
	plugin: TextEaterPlugin,
	text: string,
) {
	const hebPartsSchema = z.array(z.array(z.object({ surf: z.string(), lem: z.string() })));
	type HebParts = z.infer<typeof hebPartsSchema>;

	const makeMdForHebParts = (parts: HebParts): string => {
		return parts.map(word => word.map(part => `[[${part.lem}|${part.surf}]]`).join("|")).join(" ");
	};

	try {
		const rawResponse = await plugin.newApiService.generate({
			systemPrompt: prompts.infinitive_hebrew,
			userInput: text,
			schema: z.string(),
			withCache: false,
		});

		const response = rawResponse.replaceAll("javascript", "").replaceAll("```", "").replaceAll("\n", "").replace(/^\n+/, "").replaceAll('json', '').trim()
		const parsed = JSON.parse(response);

		const parsedResponse = hebPartsSchema.safeParse(parsed);
		if (!parsedResponse.success) {
			new Notice(`Error: ${parsedResponse.error.message}`);
			return;
		}	

		const parts = parsedResponse.data;
		return makeMdForHebParts(parts);
	} catch (error) {
		new Notice(`Error: ${error.message}`);
	}
}

