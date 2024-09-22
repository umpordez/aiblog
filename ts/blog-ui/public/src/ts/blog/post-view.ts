import config from '../config.js';
import ajaxAdapter from '../ajax-adapter.js';
import loading from '../loading.js';

const { postId } = window;

const $title = document.querySelector('#title') as HTMLHeadingElement;
const $description = document.querySelector('#description') as HTMLDivElement;

if (!$title || !$description) { throw new Error("UH OH! :/"); }

interface BlogPost {
    id: string;
    title: string;
    description: string;
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

$title.innerHTML = blogPost.title;
$description.innerHTML  = blogPost.description;