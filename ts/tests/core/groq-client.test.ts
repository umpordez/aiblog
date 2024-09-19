import assert from 'node:assert';
import test, { before } from 'node:test';

import '../test-helper';

import GroqClient from '../../core/groq-client';
import YouTubeClient from '../../core/youtube-client';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const AUDIO_TEST_FILEPATH = process.env.AUDIO_TEST_FILEPATH || '';

if (GROQ_API_KEY && AUDIO_TEST_FILEPATH) {
    before(async () => {
        const client = new YouTubeClient();
        const url = "http://www.youtube.com/watch?v=UAhB8-mdBgE";

        await client.downloadAudio(url, AUDIO_TEST_FILEPATH);
    });

    test('[GroqClient] Groq client initialize / sanitize', () => {
        const client = new GroqClient(GROQ_API_KEY);

        assert(client);
        assert(client.groq);
    });

    test('[GroqClient] Transcribe audio', async () => {
        const client = new GroqClient(GROQ_API_KEY);
        const res = await client.transcribeAudio(AUDIO_TEST_FILEPATH);

        assert(res);
    });

    test('[GroqClient] Create completions', async () => {
        const client = new GroqClient(GROQ_API_KEY);
        const res = await client.createCompletions([
            {
                content: 'Ola, estou gravando um video, de um OI',
                role: 'user'
            }
        ]);

        assert(res);
        assert(res[0].message);
    });
}
