import '../../components/header.js';

import config from '../../core/config.js';
import ajaxAdapter from '../../core/ajax-adapter.js';

const { avatarInputId } = window;

interface AvatarInputStatus {
    isRunning: boolean;
    isDone: boolean;
    isAudioDone: boolean;
    isTranscriptionDone: boolean;
    error_message?: string;
}

const $button = document.querySelector('button') as HTMLButtonElement;
const $status = document.querySelector('#statusWrapper') as HTMLDivElement;
const $error = document.querySelector('#errorMessage') as HTMLDivElement;

if (!$button || !$status || !$error) { throw new Error("UH OH! :/"); }

$button.disabled = true;

function showRetryWrapper() : void {
    const $retryWrapper = document
        .querySelector('#retryWrapper') as HTMLDivElement;

    const $retryLink = document
        .querySelector('#retryWrapper a') as HTMLAnchorElement;

    if (!$retryWrapper || !$retryLink) {
        return;
    }

    $retryWrapper.classList.remove('hidden');
    $retryLink.addEventListener('click', async (ev) => {
        ev.preventDefault();

        $error.innerHTML = '';
        $error.classList.add('hidden');

        try {
            await ajaxAdapter.post(
                `/blog-admin/${config.accountLink}` +
                `/avatar-input-status/${avatarInputId}/retry`
            );

            setTimeout(async () => { await pollStatus(); }, 500);
        } catch (ex) {
            console.error(ex);
            if (ex instanceof Error) {
                alert(ex.message);
            }
        }
    });
}

function renderStatus(status: AvatarInputStatus) : void {
    const lines : string[] = [];

    if (status.isDone || status.error_message) {
        showRetryWrapper();
    }

    if (status.isDone) {
        lines.push('<li>Audio download done ✅</li>');
        lines.push('<li>Transcription Done ✅</li>');
        lines.push('<li>Final text done ✅</li>');
    } else {
        if (status.isAudioDone) {
            lines.push('<li class="text-gray-400">Audio download done ✅</li>');
        } else {
            lines.push('<li>Downloading audio...</li>')
        }

        if (status.isTranscriptionDone) {
            lines.push('<li class="text-gray-400">Transcription done ✅</li>');
        } else if (status.isAudioDone) {
            lines.push('<li>Transcribing audio...</li>')
        } else {
            lines.push('<li class="text-gray-400">Waiting to transcribe</li>');
        }

        if (status.isTranscriptionDone) {
            lines.push('<li>Creating post...</li>')
        } else {
            lines.push('<li class="text-gray-400">Waiting to create post</li>');
        }
    }


    const html = `<ul class="list-disc px-5">${lines.join('')}</ul>`;
    $status.innerHTML = html;

    if (status.isDone) {
        $button.disabled = false;
        $button.classList.remove('opacity-20');
    }

    if (status.error_message) {
        $error.classList.remove('hidden');
        $error
            .innerHTML = `<strong>ERROR:</strong><br />${status.error_message}`;

        const $allItems = document.querySelectorAll('ul.list-disc li');

        for (const $item of $allItems) {
            $item.innerHTML = $item.innerHTML.replace('...', ' ❌');
        }
    }
}

let pollTimer = setTimeout(pollStatus, 100);

async function pollStatus() : Promise<void> {
   try {
        const status = await ajaxAdapter.get(
            `/blog-admin/${config.accountLink}` +
            `/avatar-input-status/${avatarInputId}`
        );

        renderStatus(status);
        if (status.isDone) {
            return;
        }
    } catch (ex) {
        console.error(ex);
    }

    clearTimeout(pollTimer);
    pollTimer = setTimeout(pollStatus, 1000);
}

$button.addEventListener('click', (ev) => {
    ev.preventDefault();
    if ($button.disabled) { return; }

    window.location.href = `${config.baseUrl}/avatar-input/${avatarInputId}`;
});