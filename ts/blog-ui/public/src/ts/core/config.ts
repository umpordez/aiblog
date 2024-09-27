declare global {
    interface Window {
        baseUrl?: string;
        accountLink?: string;
        baseApiUrl?: string;
        avatarInputId?: string;
        postId?: string;
    }
}

export default {
    get baseApiUrl() : string { return window.baseApiUrl || ''; },
    get baseUrl() : string { return window.baseUrl || ''; },
    get accountLink() : string { return window.accountLink || ''; }
};