import '../../components/header.js';

import { z } from '/lib/zod3.23.8.js';
import { validateZodSchema } from '../../core/utils.js';
import loading from "../../components/loading.js";

import config from '../../core/config.js';
import ajaxAdapter from '../../core/ajax-adapter.js';

const $step1Form = document.querySelector('form.step-1') as HTMLFormElement;

if (!$step1Form) { throw new Error('Something went wrong!'); }

interface YouTubeSearch {
    youtube_url: string;
}

const YouTubeSearch = z.object({
    youtube_url: z.string().refine((value) => {
        const youtubeId = value.split('?v=')[1];

        return youtubeId && youtubeId.length >= 8;
    }, { message: 'invalid youtube url maah' })
})

function getStep1Values() : YouTubeSearch {
    const values = new FormData($step1Form);
    const youtube_url = values.get('youtube_url') as string;

    return { youtube_url };
}


async function initPost(youtube_url: string) : Promise<void> {
    const values = { youtube_url };
    loading.show();

    try {
        const { avatarInputId } = await ajaxAdapter
            .post(`/blog-admin/${config.accountLink}/init-post`, {
                ...values
            });

        window.location.href = `${config.baseUrl}` +
            `/avatar-input-status/${avatarInputId}`;
    } catch (ex) {
        console.error(ex);

        if (ex instanceof Error) {
            alert(ex.message);
        }
    } finally {
        loading.hide();
    }
}

$step1Form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const values = getStep1Values();
    validateZodSchema(YouTubeSearch, values, $step1Form);

    await initPost(values.youtube_url);
});

const urlParams = new URLSearchParams(window.location.search);
const link = urlParams.get('link') || '';

if (link) {
    await initPost(link);
}
