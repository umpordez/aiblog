import fs from 'node:fs';
import assert from 'node:assert';
import test from 'node:test';

import '../test-helper';

import YouTubeClient from '../../core/youtube-client';

test('YouTube client initialize / sanitize', () => {
    const client = new YouTubeClient();

    assert(client);
    assert(client.downloadAudio);
});

test('YouTube client can download', async () => {
    const { AUDIO_TEST_FILEPATH } = process.env;

    const client = new YouTubeClient();
    const url = "http://www.youtube.com/watch?v=UAhB8-mdBgE";

    await client.downloadAudio(url, AUDIO_TEST_FILEPATH);
    const statResponse = await fs.promises.stat(AUDIO_TEST_FILEPATH);

    assert(statResponse);
    assert(statResponse.dev);
    assert(statResponse.mode);
});
