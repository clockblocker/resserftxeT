import { determine_infinitive_and_pick_emoji } from "prompts/determine-infinitive-and-pick-emoji";
import { keymaker } from "prompts/keymaker";
import { normalize } from "prompts/normalize";
import { translate_de_to_eng } from "prompts/translate-de-to-eng";
import { baseDict } from "./baseDict";
import { C1_RICHTER_PROMPT_V2 } from "./c1Richter";
import { generate_forms } from "./generate-forms";
import { morphems } from "./morphems";
import { generate_valence_block } from "./valence";

export const prompts = {
	generate_dictionary_entry: baseDict,
	c1Richter: C1_RICHTER_PROMPT_V2,
	generate_forms,
	morphems,
	determine_infinitive_and_pick_emoji,
	normalize,
	translate_de_to_eng,
	keymaker,
	generate_valence_block,
};
