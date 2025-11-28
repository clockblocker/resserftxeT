import { type Editor, Notice } from "obsidian";
import type TextEaterPlugin from "../main";

export default async function insertReplyFromKeymaker(
	plugin: TextEaterPlugin,
	editor: Editor,
	selection: string,
) {
	try {
		const response = await plugin.apiService.consultKeymaker(selection);
		if (response) {
			editor.replaceSelection(selection + "\n" + response + "\n");
		}
	} catch (error) {
		new Notice(`Error: ${error.message}`);
	}
}
