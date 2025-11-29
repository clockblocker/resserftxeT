import {
	type Editor,
	type MetadataCache,
	Notice,
	TFile,
	type Vault,
	type LinkCache,
} from "obsidian";
import {
	appendToExistingFile,
	doesExistingFileContainContent,
	getExisingOrCreatedFileInWorterDir,
} from "../utils";

export default async function addBacklinksToCurrentFile(
	file: TFile,
	backlink: string,
	vault: Vault,
	metadataCache: MetadataCache,
	editor: Editor,
) {
	try {
		const fileCache = metadataCache.getFileCache(file);
		const fileContent = await vault.read(file);
		
		let firstSlitLineIndex = null;
		let secondSlitLineIndex = null;

		for (const [index, line] of fileContent.split("\n").entries()) {
			if (line.startsWith("---")) {
				if (firstSlitLineIndex === null) {
					firstSlitLineIndex = index;
					continue;
				} else if (secondSlitLineIndex === null) {
					secondSlitLineIndex = index;
					break;
				}
			}
		}


		let links = fileCache?.links ?? [];

		if (firstSlitLineIndex !== null && secondSlitLineIndex !== null) {
			links = links.filter((link) => link.position.start.line < firstSlitLineIndex || link.position.start.line > secondSlitLineIndex);
		}

		const rawLinks = new Set(links.map(({ link }) => link));

		const resolvedPaths: { name: string; path: string | null }[] = [];

		for (const rawLink of rawLinks) {
			const linkedFile = metadataCache.getFirstLinkpathDest(rawLink, file.path);

			if (linkedFile instanceof TFile) {
				resolvedPaths.push({ name: rawLink, path: linkedFile.path });
			} else {
				resolvedPaths.push({ name: rawLink, path: null });
			}
		}

		for (const item of resolvedPaths) {
			try {
				const file = await getExisingOrCreatedFileInWorterDir(vault, item);

				if (!file) {
					continue;
				}

				const backlinkText = `[[${backlink}]]`;

				const backlinkTextInFile = await doesExistingFileContainContent(
					vault,
					file,
					backlinkText,
				);

				if (!backlinkTextInFile) {
					await appendToExistingFile(vault, file, `, ${backlinkText}`);
				}
			} catch (error) {
				new Notice(`Error processing link ${item.name}: ${error.message}`);
			}
		}
		editor.refresh();
	} catch (error) {
		new Notice(`Error processing backlinks`);
	}
}
