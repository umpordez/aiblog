import Context from '../core/context.js';
import logger from '../core/logger.js';
import YouTubeClient from '../core/external-clients/youtube.js';

const context = new Context();
const yt = new YouTubeClient();

context
    .redis
    .subscribe('avatar-input:created', async (avatarInputId: string) => {
        const avatarInput = await context.avatar.getInputById(avatarInputId);
        const AVATAR_INPUT_FILEPATH = process.env
            .AVATAR_INPUT_FILEPATH as string;

        const filepath = `${AVATAR_INPUT_FILEPATH}/${avatarInput.id}.mp3`

        logger.info([
            `Downloading ${avatarInput.id} = ${avatarInput.youtube_url}`,
            `to: ${filepath}`
        ].join('\n'));

        await yt.downloadAudio(avatarInput.youtube_url, filepath);
        await context.avatar.updateAvatarInputFilepathAndStatus(
            avatarInput.id,
            filepath
        );

        logger.info(`Download: ${avatarInput.id} done!`);
        context.redis.publishNoWait('avatar-input:downloaded', avatarInputId);
    });

logger.info('Blog Audio is ON! :)');
