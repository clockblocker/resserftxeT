import { determine_infinitive_and_pick_emoji } from "prompts/determine-infinitive-and-pick-emoji";
import { normalize } from "prompts/normalize";
import { translate_heb_to_ru } from "prompts/translate-de-to-eng";
import { baseDict } from "./baseDict";
import { generate_forms } from "./generate-forms";
import { morphems } from "./morphems";

export const prompts = {
	generate_dictionary_entry: baseDict,
	generate_forms,
	morphems,
	determine_infinitive_and_pick_emoji,
	normalize,
	translate_de_to_eng: translate_heb_to_ru,
};
