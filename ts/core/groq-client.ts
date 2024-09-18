import fs from 'node:fs';
import Groq from 'groq-sdk';

import type {
    ChatCompletionMessageParam,
    ChatCompletion
} from 'groq-sdk/resources/chat/completions';

class GroqClient {
    grokApiKey: string;
    groq: Groq;

    constructor(grokApiKey: string) {
        this.grokApiKey = grokApiKey;
        this.groq = new Groq({ apiKey: grokApiKey });
    }

    async transcribeAudio(
        filepath: string,
        model = 'whisper-large-v3',
        language = 'br',
        temperature = 0.0
    ): Promise<string> {
        const res = await this.groq.audio.transcriptions.create({
            file: fs.createReadStream(filepath),
            model,
            language,
            temperature
        });

        return res.text;
    }

    async createCompletions(
        messages: ChatCompletionMessageParam[],
        model = 'llama3-8b-8192',
        temperature = 0.5,
        maxTokens = 8000
    ): Promise<ChatCompletion.Choice[]> {
        const res = await this.groq.chat.completions.create({
            messages,
            model,
            temperature,
            max_tokens: maxTokens
        });

        return res.choices;
    }
}

export default GroqClient;
