import '../components/header.js';
import ajaxAdapter from "../core/ajax-adapter.js";

let user;
let accounts;
try {
    const res = await ajaxAdapter.get('/me');

    user = res.user;
    accounts = res.accounts;
} catch (ex) {
    console.error(ex);
}

if (!user || !accounts) {
    localStorage.clear();
    window.location.href = '/';
}

const account = accounts[0];

const $subtitle = document.querySelector('#subtitle');
if ($subtitle) { 
    $subtitle.innerHTML = `Hello ${user.name}`;
}

const $createPostLink = document
    .querySelector('#createPostLink') as HTMLAnchorElement;

if ($createPostLink) { 
    $createPostLink.href = `/blog/${account.link}/create-post`;
}

const $myPostsLink = document
    .querySelector('#myPostsLink') as HTMLAnchorElement;

if ($myPostsLink) { 
    $myPostsLink.href = `/blog/${account.link}`;
}