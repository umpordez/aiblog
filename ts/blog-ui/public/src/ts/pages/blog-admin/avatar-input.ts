import '../../components/header.js';

import { z } from '/lib/zod3.23.8.js';

import config from '../../core/config.js';
import ajaxAdapter from '../../core/ajax-adapter.js';
import loading from '../../components/loading.js';

import { validateZodSchema } from '../../core/utils.js';

const { avatarInputId } = window;

const $form = document
    .querySelector('form') as HTMLFormElement;
const $avatarName = document
    .querySelector('#avatarName') as HTMLSpanElement;

if (!$form || !$avatarName) { throw new Error("UH OH! :/"); }

interface Avatar {
    id: string;
    name: string;
}

interface AvatarInput {
    id: string;
    title: string;
    final_title: string;
    final_short_description: string;
    final_text: string;
    avatar: Avatar
    youtube_url: string;
}

interface BlogPost {
    title: string;
    description: string;
    short_description: string;
    avatarId: string;
    origin_youtube_url: string;
}

const BlogPost = z.object({
    title: z.string().min(5),
    description: z.string().min(5)
});

let avatarInput : AvatarInput;
try {
    avatarInput = await ajaxAdapter.get(
        `/blog-admin/${config.accountLink}` +
        `/avatar-input/${avatarInputId}`
    );

    loading.hide();
} catch (ex) {
    console.error(ex);

    if (ex instanceof Error) {
        alert(ex.message);
    }

    throw ex;
}

const fields = Array.from($form) as HTMLInputElement[] | HTMLTextAreaElement[];

const $title = fields
    .find((f) => f.name === 'title') as HTMLInputElement;

const $shortDescription= fields
    .find((f) => f.name === 'short_description') as HTMLTextAreaElement;

const $description = fields
    .find((f) => f.name === 'description') as HTMLTextAreaElement;

$title.value = avatarInput.final_title;
$shortDescription.value = avatarInput.final_short_description;
$description.innerHTML = avatarInput.final_text;

$avatarName.innerHTML = avatarInput.avatar.name;

function getBlogPostValues() : BlogPost {
    const values = new FormData($form);

    const title = values.get('title') as string;
    const short_description = values.get('short_description') as string;
    const description = values.get('description') as string;

    return {
        origin_youtube_url: avatarInput.youtube_url,
        title,
        description,
        short_description,
        avatarId: avatarInput.avatar.id
    };
}

$form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const values = getBlogPostValues();
    validateZodSchema(BlogPost, values, $form);

    loading.show();

    try {
        const { blogPostId } = await ajaxAdapter
            .post(`/blog-admin/${config.accountLink}/create-post`, {
                ...values
            });

        window.location.href = `${config.baseUrl}` +
            `/post/${blogPostId}`;
    } catch (ex) {
        console.error(ex);

        if (ex instanceof Error) {
            alert(ex.message);
        }
    } finally {
        loading.hide();
    }
})