import fs from 'node:fs';
import ytdl from '@distube/ytdl-core';

class YouTubeClient {
    async downloadAudio(url: string, filepath: string): Promise<void> {
        const audio = ytdl(url, { filter: 'audioonly' });
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
