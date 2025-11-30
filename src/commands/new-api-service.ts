import { Notice, requestUrl } from "obsidian";
import { TextEaterSettings } from "types";
import { logError, logWarning, formatError } from "issue-handlers";
import OpenAI from "openai";

function normalizeHeaders(initHeaders?: HeadersInit): Record<string, string> {
	if (!initHeaders) {
		return {};
	}

	const out: Record<string, string> = {};

	if (initHeaders instanceof Headers) {
		initHeaders.forEach((value, key) => {
			out[key] = value;
		});
	} else if (Array.isArray(initHeaders)) {
		for (const [key, value] of initHeaders) {
			out[key] = value;
		}
	} else {
		// Already a plain object
		Object.assign(out, initHeaders);
	}
	return out;
}

// 7 days
const TTL_SECONDS = 604800;

export class NewApiService {
	private openai: OpenAI | null = null;
	private model = "gemini-2.5-flash-lite";
	private cachedContentIds: Record<string, string> = {};

	constructor(private settings: TextEaterSettings) {
		try {
			if (this.settings.apiProvider !== "google") {
				new Notice("Only Google provider is configured in this build.");
			}
			if (!this.settings.googleApiKey) {
				new Notice("Missing Google API key in settings.");
			}

			function fetchViaObsidian(
				input: RequestInfo,
				init?: RequestInit,
			): Promise<Response> {
				const url =
					typeof input === "string" ? input : (input as any).url;

				const headers = normalizeHeaders(init?.headers);

				// Ensure Authorization header is there for Google Gemini
				if (!headers["authorization"]) {
					headers["authorization"] =
						`Bearer ${this.settings.googleApiKey}`;
				}

				if (init?.body && !headers["content-type"]) {
					headers["content-type"] = "application/json";
				}

				return requestUrl({
					body: init?.body as any,
					headers,
					method: init?.method as any,
					throw: false,
					url,
				}).then((r) => {
					return new Response(r.text, {
						headers: r.headers as any,
						status: r.status,
					});
				});
			}

			// Initialize OpenAI client with custom fetch
			this.openai = new OpenAI({
				apiKey: this.settings.googleApiKey,
				baseURL:
					"https://generativelanguage.googleapis.com/v1beta/openai/",
				dangerouslyAllowBrowser: true,
				fetch: fetchViaObsidian,
			});
		} catch (error: any) {
			logError({
				description: `Error initializing API service: ${error.message}`,
				location: "ApiService",
			});
		}
	}

	private async postGoogleApi<T>(path: string, body: any): Promise<T> {
		try {
			const res = await requestUrl({
				body: JSON.stringify(body),
				headers: {
					"content-type": "application/json",
					"x-goog-api-key": this.settings.googleApiKey,
				},
				method: "POST",
				throw: false,
				url: `https://generativelanguage.googleapis.com/v1beta/${path}`,
			});

			if (res.status >= 200 && res.status < 300) {
				return JSON.parse(res.text) as T;
			}

			throw new Error(`Google API error: ${res.status}: ${res.text}`);
		} catch (error: any) {
			const errObj = {
				description: error?.message || "Failed to call Google API",
				location: "ApiService",
			};

			logError(errObj);

			throw new Error(formatError(errObj));
		}
	}

	private async ensureCachedContentIdForSystemPrompt(
		systemPrompt: string,
	): Promise<string | null> {
		try {
			const existing = this.cachedContentIds[systemPrompt];
			if (existing) {
				return existing;
			}

			const body = {
				model: `models/${this.model}`,
				systemInstruction: {
					parts: [{ text: systemPrompt }],
				},
				ttl: `${TTL_SECONDS}s`,
			};

			const created = await this.postGoogleApi<{ name?: string }>(
				"cachedContents",
				body,
			);

			const id = created?.name;
			if (id) {
				this.cachedContentIds[systemPrompt] = id;
				return id;
			}
		} catch (___errors) {
			logWarning({
				description:
					"CachedContent creation failed; proceeding without cache",
				location: "ApiService",
			});
		}
		return null;
	}

	async generate({
		systemPrompt,
		userInput,
		withCache = true,
	}: {
		systemPrompt: string;
		userInput: string;
		withCache: boolean;
	}): Promise<string> {
		if (!this.openai) {
			throw new Error(
				"OpenAI client not initialized. Make shure that you have configured the API key in the settings.",
			);
		}

		systemPrompt = systemPrompt.replace(/^\t+/gm, "");

		const cachedId = withCache
			? await this.ensureCachedContentIdForSystemPrompt(systemPrompt)
			: null;

		const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
			[];
		if (!cachedId) {
			messages.push({ content: systemPrompt, role: "system" });
		}
		messages.push({ content: userInput, role: "user" });

		try {
			const completion = await this.openai.chat.completions.parse({
				messages,
				model: this.model,
				temperature: 0,
				top_p: 0.95,
				...(cachedId
					? {
							extra_body: {
								google: { cached_content: cachedId },
							},
						}
					: {}),
			});

			const parsed = completion.choices?.[0]?.message?.content as string;
			if (!parsed) {
				throw new Error("No response from API");
			}

			return parsed;
		} catch (err) {
			throw new Error(
				formatError({
					description: `Failed to generate: ${err?.message}`,
					location: "ApiService",
				}),
			);
		}
	}
}
