import DOMPurify from '/lib/purify3.1.6.js';

import config from '../config.js';
import ajaxAdapter from '../ajax-adapter.js';
import loading from '../loading.js';

const $blogPostsElement = document
    .querySelector('#blogPosts') as HTMLDivElement;

if (!$blogPostsElement) { throw new Error("UHHH OHHH"); }

interface BlogPost {
    id: string;
    title: string;
    description: string;
    image_url: string;
    short_description: string;
}

let blogPosts : BlogPost[];
try {
    blogPosts = await ajaxAdapter.get(`/blog/${config.accountLink}/posts`);
    loading.hide();
} catch (ex) {
    console.error(ex);

    if (ex instanceof Error) {
        alert(ex.message);
    }

    throw ex;
}

const html = blogPosts.map((p) => `
    <article class="max-w-xs">
        ${p.image_url ? `
        <a href="/blog/${config.accountLink}/post/${p.id}">
            <img
                src="${p.image_url}"
                class="mb-5 rounded-lg"
                alt="${p.title}">
        </a>` : ''}
        <h2 class="mb-2 text-xl font-bold leading-tight text-gray-900">
            <a href="/blog/${config.accountLink}/post/${p.id}">
                ${p.title}
            </a>
        </h2>
        ${p.short_description ? `
            <p class="mb-4 text-gray-500">${p.short_description}</p>
        ` : ''}
        <a
            href="/blog/${config.accountLink}/post/${p.id}"
            class="inline-flex items-center font-medium underline underline-offset-4 text-primary-600 hover:no-underline">
            Go full
        </a>
    </article>
`).join('');

$blogPostsElement.innerHTML = DOMPurify.sanitize(html);