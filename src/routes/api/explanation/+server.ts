import { openai } from '$lib/openai';
import { getWordsFromFragment } from '$lib/utils';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import * as googleTTS from 'google-tts-api'; // ES6 or TypeScript

export const POST = (async ({ request }) => {
	const { word, context, lang, langCode } = await request.json();
	const prompt = `I have a word in ${
		lang ?? 'English'
	}, and a few words of context where that word was used. I want to get a short and very simple explanation baby can understand, then a couple of usage samples, and then a few synonyms and antonyms. Write a prompt with placeholders for the word and the context

Word: {Word}
Context: {Context}

Explanation for a baby:
A simple definition of the word {Word} is: {Simple Definition}

Usage Samples:

    {Sample Sentence 1}

    {Sample Sentence 2}


Example:

Word: Happy
Context: The child was happy because he got a new toy.

Explanation for a baby:
A simple definition of the word "Happy" is: Feeling good or joyful.

Usage Samples:

    The sun was shining and everyone was happy.
	
    I feel so happy when I spend time with my friends.


Now generate for the following input

Word: ${word}
Context: ${context}

Result:`;

	const response = await openai.createCompletion({
		model: 'text-davinci-003',
		prompt: prompt,
		temperature: 0.7,
		max_tokens: 256,
		top_p: 1,
		frequency_penalty: 0,
		presence_penalty: 0
	});

	const text = response.data.choices[0]?.text;

	if (!text) {
		throw error(500, 'No text returned from OpenAI');
	}

	const audio = await googleTTS.getAllAudioBase64(text, {
		lang: langCode ?? 'en',
		slow: true
	});

	return json({
		audio,
		text
	});
}) satisfies RequestHandler;