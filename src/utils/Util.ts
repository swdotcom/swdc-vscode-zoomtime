import { commands, ViewColumn, Uri, workspace, window } from "vscode";
import { ZoomInfo } from "../models/ZoomInfo";
const fs = require("fs");
const os = require("os");

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

export function getSoftwareDir(autoCreate = true) {
    const homedir = os.homedir();
    let softwareDataDir = homedir;
    if (isWindows()) {
        softwareDataDir += "\\.software";
    } else {
        softwareDataDir += "/.software";
    }

    if (autoCreate && !fs.existsSync(softwareDataDir)) {
        fs.mkdirSync(softwareDataDir);
    }

    return softwareDataDir;
}

export function getSoftwareSessionFile() {
    let file = getSoftwareDir();
    if (isWindows()) {
        file += "\\session.json";
    } else {
        file += "/session.json";
    }
    return file;
}

export function getLocalREADMEFile() {
    let file = __dirname;
    if (isWindows()) {
        file += "\\README.md";
    } else {
        file += "/README.md";
    }
    return file;
}

export function displayReadmeIfNotExists(override = false) {
    const displayedReadme = getItem("vscode_CtReadme");
    if (!displayedReadme || override) {
        const readmeUri = Uri.file(getLocalREADMEFile());

        commands.executeCommand(
            "markdown.showPreview",
            readmeUri,
            ViewColumn.One
        );
        setItem("vscode_CtReadme", true);
    }
}

export function getItem(key: string) {
    const jsonObj = getSoftwareSessionAsJson();
    let val = jsonObj[key] || null;
    return val;
}

export function setItem(key: string, value: any) {
    const jsonObj = getSoftwareSessionAsJson();
    jsonObj[key] = value;

    const content = JSON.stringify(jsonObj);

    const sessionFile = getSoftwareSessionFile();
    fs.writeFileSync(sessionFile, content, (err: { message: any }) => {
        if (err) {
            logIt(`Error writing to the Software session file: ${err.message}`);
        }
    });
}

export function getSoftwareSessionAsJson() {
    let data = null;

    const sessionFile = getSoftwareSessionFile();
    if (fs.existsSync(sessionFile)) {
        const content = fs.readFileSync(sessionFile).toString();
        if (content) {
            try {
                data = JSON.parse(cleanJsonString(content));
            } catch (e) {
                logIt(`unable to read session info: ${e.message}`);
                data = {};
            }
        }
    }
    return data ? data : {};
}

export function writeJsonData(data: ZoomInfo[], file: string) {
    try {
        const content = JSON.stringify(data, null, 4);
        fs.writeFileSync(file, content, (err: { message: any }) => {
            if (err) {
                console.log(`error writing data: ${err.message}`);
            }
        });
    } catch (e) {
        console.log(`error writing data: ${e.message}`);
    }
}

export function getFileDataAsJson(file: string): any {
    let data = null;
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file).toString();
        if (content) {
            try {
                data = JSON.parse(cleanJsonString(content));
            } catch (e) {
                console.log(`unable to read session info: ${e.message}`);
            }
        }
    }
    return data;
}

// export function displayReadmeIfNotExists(override = false) {
//     const displayedReadme = getItem("vscode_ZtReadme");
//     if (!displayedReadme || override) {
//         const readmeUri = Uri.file(getLocalREADMEFile());

//         commands.executeCommand(
//             "markdown.showPreview",
//             readmeUri,
//             ViewColumn.One
//         );
//         setItem("vscode_CtReadme", true);
//     }
// }

export function openFileInEditor(file: string) {
    workspace.openTextDocument(file).then(
        doc => {
            // Show open document and set focus
            window
                .showTextDocument(doc, 1, false)
                .then(undefined, (error: any) => {
                    if (error.message) {
                        window.showErrorMessage(error.message);
                    } else {
                        console.log(error);
                    }
                });
        },
        (error: any) => {
            if (
                error.message &&
                error.message.toLowerCase().includes("file not found")
            ) {
                window.showErrorMessage(
                    `Cannot open ${file}.  File not found.`
                );
            } else {
                console.log(error);
            }
        }
    );
}

export function cleanJsonString(content: string) {
    content = content
        .replace(/\r\n/g, "")
        .replace(/\n/g, "")
        .trim();
    return content;
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
