import {
	type GenerationConfig,
	GoogleGenerativeAI,
	HarmBlockThreshold,
	HarmCategory,
	ResponseSchema,
} from "@google/generative-ai";
import { Notice, requestUrl, TAbstractFile, TFile, type Vault } from "obsidian";
import { z } from "zod/v4";
import { prompts } from "./prompts";
import type { TextEaterSettings } from "./types";

export class ApiService {
	private genAI: GoogleGenerativeAI | null = null;
	private model = "gemini-2.0-flash-lite";
	private chatSessions: { [key: string]: any } = {};

	constructor(
		private settings: TextEaterSettings,
		private vault: Vault,
	) {
		try {
			if (this.settings.apiProvider === "google") {
				this.genAI = new GoogleGenerativeAI(this.settings.googleApiKey);
			}
		} catch (error) {
			new Notice(`Error initializing API service: ${error.message}`);
		}
	}

	async generateContent(
		systemPrompt: string,
		userInput: string,
		responseSchema?: boolean,
	): Promise<string> {
		const startTime = performance.now();
		try {
			let response: string | null = null;
			// Remove leading tab characters from the system prompt
			systemPrompt = systemPrompt.replace(/^\t+/gm, "");

			if (this.settings.apiProvider !== "google") {
				if (!this.settings.googleApiKey) {
					throw new Error("Google API key not configured.");
				}
				throw new Error("API provider not configured correctly.");
			}

			if (!this.genAI) {
				this.genAI = new GoogleGenerativeAI(this.settings.googleApiKey);
			}

			const generationConfig: GenerationConfig = !responseSchema
				? {
						temperature: 0,
						topP: 0.95,
						topK: 64,
						maxOutputTokens: 2048,
					}
				: {
						temperature: 0,
						topP: 0.95,
						topK: 64,
						maxOutputTokens: 1024,
						responseMimeType: `application/json`,
					};

			const chatKey = systemPrompt;
			if (!this.chatSessions[chatKey]) {
				const model = this.genAI.getGenerativeModel({
					model: this.model,
					systemInstruction: systemPrompt,
				});
				this.chatSessions[chatKey] = model.startChat({
					generationConfig: generationConfig,
					history: [],
				});
			}

			const chatSession = this.chatSessions[chatKey];

			const result = await chatSession.sendMessage(userInput);
			response = result.response.text();

			const logResponse = response === null ? "" : response;
			return logResponse;
		} catch (error: any) {
			const endTime = performance.now();
			const duration = endTime - startTime;
			throw new Error(error.message);
		}
	}

	async fetchTemplate(word: string): Promise<string> {
		const [dictionaryEntry] = await Promise.all([
			this.generateContent(prompts.generate_dictionary_entry, word),
		]);
		return `${dictionaryEntry.replace("<agent_output>", "").replace("</agent_output>", "")}\n\n---\n`;
	}

	async determineInfinitive(word: string): Promise<string> {
		const rawResponse = await this.generateContent(
			prompts.infinitive_hebrew,
			word,
		);

		const response = rawResponse.replaceAll("```javascript", "").replaceAll("```", "").replaceAll("\n", "").replace(/^\n+/, "").trim()
		return response;
	}

	async normalize(text: string): Promise<string> {
		return this.generateContent(prompts.normalize, text);
	}

	async translateText(text: string): Promise<string> {
		return this.generateContent(prompts.translate_de_to_eng, text);
	}
}
