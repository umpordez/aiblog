import '../components/header.js';
import ajaxAdapter from "../core/ajax-adapter.js";

interface BlogPost {
    link: string;
    title: string;
}

let blogs : BlogPost[] = [];
try {
    const res = await ajaxAdapter.get('/blogs');

    blogs = res.blogs;
} catch (ex) {
    console.error(ex);
}

const html = `
    ${blogs.map((b) =>`
        <a
            href='/blog/${b.link}'
            class="text-center bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            ${b.title}
        </a>
    `).join('')}

`;

const $el = document.querySelector('main div .grid');
if (!$el) { throw new Error('uhoh'); }

$el.innerHTML = html;