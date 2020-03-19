import { isWindows } from "./Util";
import { commands, ViewColumn, Uri, workspace, window } from "vscode";
import { ZoomInfo } from "../models/ZoomInfo";
const os = require("os");
const fs = require("fs");

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
