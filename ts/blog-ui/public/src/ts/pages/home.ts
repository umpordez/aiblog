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
    <h1 class='text-xl font-bold leading-tight tracking-tight'>All blogs</h1>
    <ul style="max-width: 400px">
        ${blogs.map((b) =>`
            <li style="
                padding: 10px;
                background: white;
                border-radius: 5px;
                margin-bottom: 5px
            ">
                <a href='/blog/${b.link}'>${b.title}</a>
            </li>
        `).join('')}
    </ul>
`;

const $el = document.querySelector('main div');
if (!$el) { throw new Error('uhoh'); }

$el.innerHTML = html;