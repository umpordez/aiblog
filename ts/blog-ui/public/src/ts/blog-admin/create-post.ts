import { z } from '/lib/zod3.23.8.js';
import { validateZodSchema } from '../utils.js';
import loading from "../loading.js";

import config from '../config.js';
import ajaxAdapter from '../ajax-adapter.js';

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

$step1Form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const values = getStep1Values();
    validateZodSchema(YouTubeSearch, values, $step1Form);

    loading.show();

    try {
        const res = await ajaxAdapter
            .post(`/blog-admin/${config.accountLink}/init-post`, {
                ...values
            });

        console.log(res);
    } catch (ex) {
        console.error(ex);

        if (ex instanceof Error) {
            alert(ex.message);
        }
    } finally {
        loading.hide();
    }
});