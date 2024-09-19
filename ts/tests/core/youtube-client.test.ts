import fs from 'node:fs';
import assert from 'node:assert';
import test from 'node:test';

import '../test-helper';

import YouTubeClient from '../../core/external-clients/youtube';

const AUDIO_TEST_FILEPATH = process.env.AUDIO_TEST_FILEPATH || '';

if (AUDIO_TEST_FILEPATH) {
    test('[YouTubeClient] client initialize / sanitize', () => {
        const client = new YouTubeClient();

        assert(client);
        assert(client.downloadAudio);
    });

    test('[YouTubeClient] can download', async () => {
        const client = new YouTubeClient();
        const url = "http://www.youtube.com/watch?v=UAhB8-mdBgE";

        await client.downloadAudio(url, AUDIO_TEST_FILEPATH);
        const statResponse = await fs.promises.stat(AUDIO_TEST_FILEPATH);

        assert(statResponse);
        assert(statResponse.dev);
        assert(statResponse.mode);
    });
}