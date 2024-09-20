import { z } from '/lib/zod3.23.8.js';
import { validateZodSchema } from '../utils.js';
import ajaxAdapter from '../ajax-adapter.js';
import loading from '../loading.js';

interface Login {
    email: string;
    password: string
}

const Login = z.object({
    email: z.string().email(),
    password: z.string().min(5)
});

const $form = document.querySelector('form');

function getFormValues() : Login {
    if (!$form) { throw new Error('Something went very wrong'); }

    const values = new FormData($form);
    const email = values.get('email') as string;
    const password = values.get('password') as string;

    return { email, password };
}

let isInRequest = false;
$form?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const values = getFormValues();

    validateZodSchema(Login, values, $form);
    if (isInRequest) { return; }

    isInRequest = true;

    try {
        loading.show();
        const { token } = await ajaxAdapter.post('/login', values);
        // best approach or NAAH?
        localStorage.setItem('token', token);

        window.location.href = '/my-account';
    } catch (ex) {
        loading.hide();
        console.error(ex);
        isInRequest = false;
        alert(ex);
    }
});