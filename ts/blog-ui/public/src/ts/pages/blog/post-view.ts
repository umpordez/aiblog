import '../../components/header.js';

import DOMPurify from '/lib/purify3.1.6.js';

import config from '../../core/config.js';
import ajaxAdapter from '../../core/ajax-adapter.js';
import loading from '../../components/loading.js';

const { postId } = window;

const $title = document.querySelector('#title') as HTMLHeadingElement;
const $description = document.querySelector('#description') as HTMLDivElement;
const $postVideoUrl = document
    .querySelector('#postVideoUrl') as HTMLAnchorElement;

if (!$title || !$description || !$postVideoUrl) { throw new Error("UH OH! :/"); }

interface BlogPost {
    id: string;
    title: string;
    description: string;
    origin_youtube_url: string;
}

let blogPost : BlogPost;
try {
    blogPost = await ajaxAdapter.get(
        `/blog/${config.accountLink}` +
        `/post/${postId}`
    );

    loading.hide();
} catch (ex) {
    console.error(ex);

    if (ex instanceof Error) {
        alert(ex.message);
    }

    throw ex;
}

$title.innerHTML = DOMPurify.sanitize(blogPost.title);
$description.innerHTML  = DOMPurify.sanitize(blogPost.description);

const youtubeUrl = (blogPost.origin_youtube_url || '').split('&t=')[0];

$postVideoUrl.setAttribute('href', youtubeUrl);
$postVideoUrl.innerHTML = youtubeUrl;
