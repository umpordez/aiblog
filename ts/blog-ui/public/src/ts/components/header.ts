function toggleHeaderButtons() : void {
    const $headerLinkMyAccount = document
        .querySelector('#headerLinkMyAccount') as HTMLLIElement;

    const $headerLinkLogin = document
        .querySelector('#headerLinkLogin') as HTMLLIElement;

    const $headerLinkCreateAccount = document
        .querySelector('#headerLinkCreateAccount') as HTMLLIElement;

    const isLoggedIn = Boolean(localStorage.getItem('token'));

    $headerLinkMyAccount.classList.toggle('hidden', !isLoggedIn)
    $headerLinkLogin.classList.toggle('hidden', isLoggedIn)
    $headerLinkCreateAccount.classList.toggle('hidden', isLoggedIn)
}

toggleHeaderButtons();