function loggedIn() {
    usernameSelect = document.querySelector("#userinfo-btnInnerEl");
    usernameSelect.click();
    usernameSelect.click();
    if(usernameSelect) {
        const loggedUser = usernameSelect.textContent && usernameSelect.textContent.trim().length > 0;
        return loggedUser;
    } else {
        return false;
    }
}

function containsText(el, text) {
    return el.textContent && el.textContent.trim().includes(text);
}

function findLoginButton() {
    const candidates = document.querySelectorAll('a.x-btn');
    for (const el of candidates) {
        if (containsText(el, 'Login')) {
            return el;
        }
    }
    return null;
}

function findLogoutButton() {
    const candidates = document.querySelectorAll('a.x-menu-item-link');
    for (const el of candidates) {
        if (containsText(el, 'Logout')) {
            return el;
        }
    }
    return null;
}

async function removeMessageBox(retry = 5) {
    const box = document.getElementsByClassName('x-message-box')[0];
    let closed = false;
    if (box) {
        const button = box.getElementsByClassName('x-btn')[0];
        if (button) {
            button.click();
            closed = true;
        }
    }
    if (!closed && retry > 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
        await removeMessageBox(retry - 1);
    }
}

async function tryLogin() {
    creds = await window.appAPI.getCredentials(window.__PROXMOX_ID__);
    if (creds) {
        const userInput = document.querySelector('input[name="username"]');
        const passInput = document.querySelector('input[name="password"]');
        const btn = findLoginButton();

        if (userInput && passInput && btn) {
            userInput.value = creds.account.split("@")[0];
            passInput.value = creds.password;
            btn.click();
            await new Promise(resolve => setTimeout(resolve, 500));
            removeMessageBox();
        }
        
        user = loggedIn();
        if (user) {
            console.log("Zalogowano jako " + creds.account);
            window.__READY_TO_SHOW__ = true;
            const logoutBtn = findLogoutButton();
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    window.appAPI.closeProxmoxWindow(window.__PROXMOX_ID__);
                });
            }
        } else {
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log("Logowanie nieudane, ponawiam próbę...");
            tryLogin();
        }
    } else {
        alert("Missing credentials, is system wallet unlocked?");
        window.__READY_TO_SHOW__ = false;
    }
}

tryLogin();