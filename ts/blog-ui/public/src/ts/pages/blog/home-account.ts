import '../../components/header.js';

import DOMPurify from '/lib/purify3.1.6.js';

import config from '../../core/config.js';
import ajaxAdapter from '../../core/ajax-adapter.js';
import loading from '../../components/loading.js';

const $blogPostsElement = document
    .querySelector('#blogPosts') as HTMLDivElement;

const $mainTitle = document
    .querySelector('#mainTitle') as HTMLHeadingElement;

if (!$blogPostsElement || !$mainTitle) { throw new Error("UHHH OHHH"); }

interface BlogPost {
    id: string;
    title: string;
    description: string;
    image_url: string;
    short_description: string;
}

interface Account {
    id: string;
    title: string;
}

let blogPosts : BlogPost[];
let account : Account;

try {
    const res = await ajaxAdapter.get(`/blog/${config.accountLink}/posts`);
    blogPosts = res.blogPosts;
    account = res.account;

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
            class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Post Completo
        </a>
    </article>
`).join('');

$blogPostsElement.innerHTML = DOMPurify.sanitize(html);
$mainTitle.innerHTML = `Posts de: ${account.title}`;