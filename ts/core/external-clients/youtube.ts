import fs from 'node:fs';
import ytdl from '@distube/ytdl-core';

class YouTubeClient {
    async downloadAudio(url: string, filepath: string): Promise<void> {
        const cookies = [];

        const cookieKeys = [ 'HSID', 'SSID', 'SID' ];
        for (const key of cookieKeys) {
            const envKey = `YOUTUBE_COOKIE_${key}`;
            const envValue = process.env[envKey];

            if (envValue) { cookies.push({ name: key, value: envValue }); }
        }

        const agent = ytdl.createAgent(cookies);
        const audio = ytdl(url, {
            agent,
            filter: 'audioonly',
            quality: 'lowest'
        });

        const stream = fs.createWriteStream(filepath);

        return new Promise((resolve, reject) => {
            audio
                .pipe(stream)
                .on('error', reject)
                .on('finish', resolve)
        });
    }
}

export default YouTubeClient;
