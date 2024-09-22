import markdown from '@wcj/markdown-to-html';

import Context from '../core/context.js';
import logger from '../core/logger.js';
import GroqClient from '../core/external-clients/groq.js';

const context = new Context();
const groq = new GroqClient();

const mode = process.argv[2];

if (mode === '--transcribe') {
    context
        .redis
        .subscribe('avatar-input:downloaded', async (avatarInputId: string) => {
            const avatarInput = await context.avatar.getInputById(avatarInputId);

            logger.info([
                `Transcribing: ${avatarInput.id} = ${avatarInput.filepath}`
            ].join('\n'));

            const audioTranscription = await groq.transcribeAudio(
                avatarInput.filepath
            );

            await context.avatar.updateAvatarInputTranscriptionAndStatus(
                avatarInput.id,
                audioTranscription
            );

            logger.info(`Transcription: ${avatarInput.id} done!`);
            context.redis.publishNoWait(
                'avatar-input:transcribed',
                avatarInputId
            );
        });
}

if (mode === '--create-post') {
    context
        .redis
        .subscribe('avatar-input:transcribed', async (avatarInputId: string) => {
            const avatarInput = await context.avatar.getInputById(avatarInputId);

            logger.info(`Creating Post: ${avatarInput.id}`);

            const choices = await groq.createCompletions([
                {
                    role: 'system',
                    content: avatarInput.avatar.system_prompt
                },
                {
                    role: 'user',
                    content: `reference text:\n${avatarInput.transcription}`
                }
            ]);


            await context.avatar.updateAvatarInputFullTextAndStatus(
                avatarInput.id,
                markdown(choices[0].message.content)
            );

            logger.info(`Create Post Done: ${avatarInput.id} done!`);
            context.redis.publishNoWait('avatar-input:done', avatarInputId);
        });
}

logger.info(`Blog AI is ON! Mode: ${mode}`);
