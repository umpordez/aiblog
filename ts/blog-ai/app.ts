import fs from 'node:fs';
import markdown from '@wcj/markdown-to-html';

import Context from '../core/context.js';
import logger from '../core/logger.js';
import GroqClient from '../core/external-clients/groq.js';


const context = new Context();
const mode = process.argv[2];

async function transcribeAudio(avatarInputId: string) : Promise<void> {
    const avatarInput = await context.avatar.getInputById(avatarInputId);
    if (!avatarInput.avatar) { throw new Error('UH OH! Something very odd..'); }

    const account = await context.account
        .getById(avatarInput.avatar.account_id);

    const groq = new GroqClient(account.ai_api_key);

    logger.info([
        `Transcribing: ${avatarInput.id} = ${avatarInput.filepath}`
    ].join('\n'));

    const audioTranscription = await groq.transcribeAudio(
        avatarInput.filepath
    );

    await fs.promises.unlink(avatarInput.filepath);
    await context.avatar.updateAvatarInputTranscriptionAndStatus(
        avatarInput.id,
        audioTranscription
    );

    logger.info(`Transcription: ${avatarInput.id} done!`);
    context.redis.publishNoWait(
        'avatar-input:transcribed',
        avatarInputId
    );
}

async function createPost (avatarInputId: string) : Promise<void> {
    const avatarInput = await context.avatar.getInputById(avatarInputId);
    if (!avatarInput.avatar) { throw new Error('UH OH! Something very odd..'); }

    const account = await context.account
        .getById(avatarInput.avatar.account_id);

    if (!avatarInput.avatar) {
        throw new Error(`Something went wrong!`);
    }

    const groq = new GroqClient(account.ai_api_key);
    logger.info(`Creating Post: ${avatarInput.id}`);

    const blogPostChoices = await groq.createCompletions([
        {
            role: 'system',
            content: `
                You are a skilled blog writer.
                Your output must be in a well formatted markdown,
                making good use of white space and typography.
                You are writing a blog post, should not mention the video.
                This should be well written in the target language,
                you are very good with words for your audience.
                You must write a detailed blog post based on your
                details using the reference text.
            `
        },

        {
            role: 'system',
            content: avatarInput.avatar.system_prompt
        },

        {
            role: 'user',
            content: `reference text:\n${avatarInput.transcription}`
        }
    ]);

    const firstChoice = blogPostChoices[0];
    if (!firstChoice || !firstChoice || !firstChoice.message) {
        throw new Error('Something went wrong!');
    }

    const postMarkdown = firstChoice.message.content as string;
    const blogTitleChoices = await groq.createCompletions([
        {
            role: 'system',
            content: `
                You are a skilled blog writer.
                Your output must be a well written title,
                it must have less then 250 characteres, you should
                NOT describe why, must output only the title.
                This should be well written in the target language,
                you are very good with words for your audience.
                Use the reference text to make your title.

                Your output must be only one paragraph.
            `
        },

        {
            role: 'system',
            content: avatarInput.avatar.system_prompt
        },

        {
            role: 'user',
            content: `reference text:\n${postMarkdown}`
        }
    ]);

    const blogSummarizeChoices = await groq.createCompletions([
        {
            role: 'system',
            content: `
                You are a skilled blog writer.
                Your output must be a well written short description,
                it must have less then 500 characteres, you should
                NOT describe why, must output only the short description.
                This should be well written in the target language,
                you are very good with words for your audience.
                Use the reference text to summarize your short text.
                Your output must be only one paragraph.
            `
        },

        {
            role: 'system',
            content: avatarInput.avatar.system_prompt
        },

        {
            role: 'user',
            content: `reference text:\n${postMarkdown}`
        }
    ]);

    const firstChoiceBlogTitle = blogTitleChoices[0];
    const firstChoiceBlogSummarize = blogSummarizeChoices[0];

    let finalTitle = '';
    let finalShortDescription = '';

    if (firstChoiceBlogTitle) {
        finalTitle = firstChoiceBlogTitle.message.content as string;
    }

    if (firstChoiceBlogSummarize) {
        finalShortDescription = firstChoiceBlogSummarize.message.content as string;
    }

    await context.avatar.updateAvatarInputFullTextAndStatus(
        avatarInput.id,
        finalTitle,
        finalShortDescription,
        markdown(postMarkdown) as string
    );

    logger.info(`Create Post Done: ${avatarInput.id} done!`);
    context.redis.publishNoWait('avatar-input:done', avatarInputId);
}

if (mode === '--transcribe') {
    context.redis.subscribe('avatar-input:downloaded', transcribeAudio);
}

if (mode === '--create-post') {
    context.redis.subscribe('avatar-input:transcribed', createPost);
}

logger.info(`Blog AI is ON! Mode: ${mode}`);
