import { type Editor, Notice, type TFile } from "obsidian";
import type TextEaterPlugin from "../main";

export default async function normalizeSelection(
	plugin: TextEaterPlugin,
	editor: Editor,
	file: TFile,
	selection: string,
) {
	try {
		const response = await plugin.apiService.normalize(selection);
		if (response) {
			editor.replaceSelection(response);
		}
	} catch (error) {
		new Notice(`Error: ${error.message}`);
	}
}
