import BaseModel from './base.js';

export interface Avatar {
    id: string;
    account_id: string;
    name: string;
    system_prompt: string;
}

export interface AvatarCreate {
    name: string;
    system_prompt: string;
}

interface AvatarInputWithStatus {
    status: 'waiting' |
        'downloading' |
        'downloaded' |
        'transcribing' |
        'transcribed' |
        'creating' |
        'done'
}

interface AvatarInputUpdateData extends AvatarInputWithStatus {
    error_message?: string | null
}

interface AvatarInput extends AvatarInputWithStatus {
    id: string;
    final_title: string;
    final_short_description: string;
    account_id: string;
    youtube_url: string;
    avatar?: Avatar;
    transcription: string;
    final_text: string;
    filepath: string;
}

interface AvatarInputStatus {
    isRunning: boolean;
    isDone: boolean;
    isAudioDone: boolean;
    isTranscriptionDone: boolean;
    error_message?: string;
}

class AvatarModel extends BaseModel {
    async updateAvatarInputErrorMessage(
        avatarInputId: string,
        errorMessage?: string
    ) : Promise<void> {
        await this.knex('avatar_inputs').update({
            error_message: errorMessage
        }).where({ id: avatarInputId });
    }

    async create(accountId: string, { name, system_prompt }: {
        name: string,
        system_prompt: string
    }): Promise<Avatar> {
        const insertResponse = await this.knex('avatars').insert({
            account_id: accountId,
            name,
            system_prompt
        }).returning('*');

        return insertResponse[0];
    }

    async updateAvatarInputData(
        avatarInputId: string,
        avatarInputData: AvatarInputUpdateData
    ) : Promise<void> {
        await this.knex('avatar_inputs').update({
            ...avatarInputData
        }).where({ id: avatarInputId });
    }

    async updateAvatarInputTranscriptionAndStatus(
        avatarInputId: string,
        transcription: string
    ) : Promise<void> {
        await this.knex('avatar_inputs').update({
            transcription,
            status: 'transcribed'
        }).where({ id: avatarInputId });
    }

    async updateAvatarInputFullTextAndStatus(
        avatarInputId: string,
        final_title: string,
        final_short_description: string,
        final_text: string
    ) : Promise<void> {
        await this.knex('avatar_inputs').update({
            final_title,
            final_short_description,
            final_text,
            status: 'done'
        }).where({ id: avatarInputId });
    }

    async updateAvatarInputFilepathAndStatus(
        avatarInputId: string,
        filepath: string
    ) : Promise<void> {
        await this.knex('avatar_inputs').update({
            filepath,
            status: 'downloaded'
        }).where({ id: avatarInputId });
    }

    async getInputById(
        avatarInputId: string
    ): Promise<AvatarInput> {
        const avatarInput = await this.knex('avatar_inputs').where({
            id: avatarInputId
        }).first();

        const avatar = await this.knex('avatars').where({
            id: avatarInput.avatar_id
        }).first();

        avatarInput.avatar = avatar;

        return avatarInput;
    }

    async getInputByAccountAndId(
        accountId: string,
        avatarInputId: string
    ): Promise<AvatarInput> {
        // selects the first avatar of account, MUST change this to
        // support multiple avatars
        const avatar = await this.knex('avatars').where({
            account_id: accountId
        }).first();

        const avatarInput = await this.knex('avatar_inputs').where({
            avatar_id: avatar.id,
            id: avatarInputId
        }).first();

        avatarInput.avatar = avatar;
        return avatarInput;
    }

    async getInputStatus(
        accountId: string,
        avatarInputId: string
    ): Promise<AvatarInputStatus> {
        // selects the first avatar of account, MUST change this to
        // support multiple avatars
        const avatar = await this.knex('avatars').where({
            account_id: accountId
        }).first();

        const avatarInput = await this.knex('avatar_inputs').where({
            avatar_id: avatar.id,
            id: avatarInputId
        }).first();

        return {
            error_message: avatarInput.error_message,
            isDone: avatarInput.status === 'done',
            isRunning: ![ 'done', 'waiting' ]
                .includes(avatarInput.status),
            isAudioDone: ![ 'waiting', 'downloading' ]
                .includes(avatarInput.status),

            isTranscriptionDone: [
                'transcribed',
                'creating',
                'done'
            ].includes(avatarInput.status),
        };
    }

    async createInput(
        accountId: string,
        youtubeUrl: string
    ) : Promise<AvatarInput> {
        // selects the first avatar of account, MUST change this to
        // support multiple avatars
        const avatar = await this.knex('avatars').where({
            account_id: accountId
        }).first();

        const insertResponse = await this.knex('avatar_inputs').insert({
            avatar_id: avatar.id,
            youtube_url: youtubeUrl,
            status: 'waiting'
        }).returning('*');

        return insertResponse[0];
    }
}

export default AvatarModel;
