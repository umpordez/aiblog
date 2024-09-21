import config from '../config.js';
import ajaxAdapter from '../ajax-adapter.js';

const { avatarInputId } = window;

interface AvatarInputStatus {
    isRunning: boolean;
    isDone: boolean;
    isAudioDone: boolean;
    isTranscriptionDone: boolean;
}

const $button = document.querySelector('button') as HTMLButtonElement;
const $status = document.querySelector('#statusWrapper') as HTMLDivElement;

if (!$button || !$status) { throw new Error("UH OH! :/"); }

$button.disabled = true;

function renderStatus(status: AvatarInputStatus) : void {
    const lines : string[] = [];

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
}

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

    setTimeout(pollStatus, 1000);
}

await pollStatus();

$button.addEventListener('click', (ev) => {
    ev.preventDefault();
    if ($button.disabled) { return; }

    window.location.href = `${config.baseUrl}/avatar-input/${avatarInputId}`;
});