import { isWindows } from "./Util";
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

export function writeJsonData(data: any, file: string) {
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

export function cleanJsonString(content: string) {
    content = content
        .replace(/\r\n/g, "")
        .replace(/\n/g, "")
        .trim();
    return content;
}
