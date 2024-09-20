import { z } from '/lib/zod3.23.8.js';
import { validateZodSchema } from '../utils.js';
import ajaxAdapter from '../ajax-adapter.js';
import loading from '../loading.js';

interface User {
    name: string;
    email: string;
    password: string;
}

interface Account {
    title: string;
    link: string;
    groq_api_key: string;
}

interface Avatar {
    avatar_name: string;
    avatar_description: string;
}

const User = z.object({
    name: z.string().min(5),
    email: z.string().email(),
    password: z.string().min(5)
});

const Account = z.object({
    title: z.string().min(5),
    link: z.string().min(4),
    groq_api_key: z.string()
});

const Avatar = z.object({
    avatar_name: z.string().min(5),
    avatar_description: z.string().min(10)
});

const $form = document.querySelector('form');

function getFormValues() : {
    avatar: Avatar,
    account: Account,
    user: User
} {
    if (!$form) { throw new Error('Something went very wrong'); }

    const values = new FormData($form);
    const name = values.get('name') as string;
    const email = values.get('email') as string;
    const password = values.get('password') as string;
    const title = values.get('title') as string;
    const link = values.get('link') as string;
    const groq_api_key = values.get('groq_api_key') as string;
    const avatar_name = values.get('avatar_name') as string;
    const avatar_description = values.get('avatar_description') as string;

    return {
        user: { name, email, password },
        account: { title, link, groq_api_key },
        avatar: { avatar_name, avatar_description }
    };
}

let isSaving = false;
$form?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const values = getFormValues();

    validateZodSchema(User, values.user, $form);
    validateZodSchema(Account, values.account, $form);
    validateZodSchema(Avatar, values.avatar, $form);

    if (isSaving) { return; }

    isSaving = true;

    try {
        loading.show();
        await ajaxAdapter.post('/create-account', values);

        alert('Conta criada com sucesso!');
        window.location.href = '/login';
    } catch (ex) {
        loading.hide();

        console.error(ex);
        isSaving = false;
        alert(ex);
    }
});