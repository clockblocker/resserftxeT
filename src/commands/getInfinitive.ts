import { type Editor, Notice, type TFile } from "obsidian";
import type TextEaterPlugin from "../main";
import z from "zod";

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

	await plugin.fileService.writeToOpenedFile(` ${res} \n`);
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
		const response = await plugin.apiService.determineInfinitive(text);

		const parsed = JSON.parse(response);
		console.log(parsed);

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

