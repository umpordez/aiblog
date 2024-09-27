export default {
    show() {
        const el = document.querySelector('#loadingOverlay');
        if (!el) { return; }

        el.classList.remove('hidden');
    },

    hide() {
        const el = document.querySelector('#loadingOverlay');
        if (!el) { return; }

        el.classList.add('hidden');
    }
}