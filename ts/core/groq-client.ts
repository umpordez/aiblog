import fs from 'node:fs';
import Groq from 'groq-sdk';

interface Message {
    role: string;
    content: string;
}

interface Choices {
    index: number;
    message: Message;
    logprobs?: boolean;
    finish_reason: string
}

class GroqClient {
    grokApiKey: string;
    client: Groq;

    constructor(grokApiKey: string) {
        this.grokApiKey = grokApiKey;
        this.groq = new Groq({ apiKey: grokApiKey });
    }

    async transcribeAudio(
        filepath: string,
        model: string = 'whisper-large-v3',
        language: string = 'br',
        temperature: number = 0.0
    ): string {
        const res = await this.groq.audio.transcriptions.create({
            file: fs.createReadStream(filepath),
            model,
            language,
            temperature
        });

        return res.text;
    }

    async createCompletions(
        messages: Array<Message>,
        model: string = 'llama3-8b-8192',
        temperature: number = 0.5,
        maxTokens: number = 8000
    ): Array<Choices> {
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
