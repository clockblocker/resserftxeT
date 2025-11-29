import { type Editor, Notice } from "obsidian";
import type TextEaterPlugin from "../main";
import { prompts } from "prompts";
import z from "zod";

export default async function translateSelection(
	plugin: TextEaterPlugin,
	editor: Editor,
	selection: string,
) {
	try {
		const cursor = editor.getCursor();
		const response = await plugin.newApiService.generate({
			systemPrompt: prompts.translate_de_to_eng,
			userInput: selection,
			schema: z.string(),
			withCache: false,
		});
		
		if (response) {
			editor.replaceSelection(selection + "\n\n" + response + "\n");
			editor.setCursor({
				line: cursor.line,
				ch: cursor.ch + selection.length,
			});
		}
	} catch (error) {
		new Notice(`Error: ${error.message}`);
	}
}
