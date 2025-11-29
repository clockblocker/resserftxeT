import { type Editor, Notice, type TFile } from "obsidian";
import type TextEaterPlugin from "../main";
import z from "zod";

const hebPartsSchema = z.array(z.array(z.object({ surf: z.string(), lem: z.string() })));
type HebParts = z.infer<typeof hebPartsSchema>;

const makeMdForHebParts = (parts: HebParts): string => {
	return parts.map(word => word.map(part => `[[${part.lem}|${part.surf}]]`).join("|")).join(" ");
};

export default async function getInfinitiveFromFilename(
	plugin: TextEaterPlugin,
	file: TFile,
) {
	const word = file.basename;

	try {
		const response = await plugin.apiService.determineInfinitive(word);

		const parsed = JSON.parse(response);
		console.log(parsed);

		const parsedResponse = hebPartsSchema.safeParse(parsed);
		if (!parsedResponse.success) {
			new Notice(`Error: ${parsedResponse.error.message}`);
			return;
		}	

		const parts = parsedResponse.data;
		await plugin.fileService.writeToOpenedFile(file.path, ` ${makeMdForHebParts(parts)} \n`);
	} catch (error) {
		new Notice(`Error: ${error.message}`);
	}
}
