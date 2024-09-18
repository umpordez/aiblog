import assert from 'node:assert';
import test from 'node:test';

import '../test-helper';

import GroqClient from '../../core/groq-client';

if (process.env.GROQ_API_KEY) {
    test('Groq client initialize / sanitize', () => {
        const client = new GroqClient(process.env.GROQ_API_KEY);

        assert(client);
        assert(client.groq);
    });

    test('Transcribe audio', async () => {
        const client = new GroqClient(process.env.GROQ_API_KEY);
        const res = await client.transcribeAudio('./audio-test.m4a');

        assert(res);
    });

    test('Create completions', async () => {
        const client = new GroqClient(process.env.GROQ_API_KEY);
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
