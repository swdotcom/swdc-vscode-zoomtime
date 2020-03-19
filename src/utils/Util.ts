const open = require("open");

export function getExtensionName() {
    return "zoom-time";
}

export function isWindows() {
    return process.platform.indexOf("win32") !== -1;
}

export function isMac() {
    return process.platform.indexOf("darwin") !== -1;
}

export function launchUrl(url: string) {
    open(url);
}

export function logIt(message: string) {
    console.log(`${getExtensionName()}: ${message}`);
}

export function isValidUrl(url: string) {
    const res = url.match(
        /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
    );
    return !res ? false : true;
}
