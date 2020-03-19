export function getExtensionName() {
    return "zoom-time";
}

export function logIt(message: string) {
    console.log(`${getExtensionName()}: ${message}`);
}
