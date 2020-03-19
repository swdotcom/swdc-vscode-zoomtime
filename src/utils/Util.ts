export function getExtensionName() {
    return "zoom-time";
}

export function isWindows() {
    return process.platform.indexOf("win32") !== -1;
}

export function isMac() {
    return process.platform.indexOf("darwin") !== -1;
}

export function logIt(message: string) {
    console.log(`${getExtensionName()}: ${message}`);
}
