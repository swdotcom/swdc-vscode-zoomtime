import { ZoomInfo } from "../models/ZoomInfo";
import { window, commands } from "vscode";
import {
    isWindows,
    isValidUrl,
    getFileDataAsJson,
    writeJsonData,
    openFileInEditor,
    getSoftwareDir
} from "../utils/Util";

export class ZoomInfoManager {
    private static instance: ZoomInfoManager;

    constructor() {}

    static getInstance(): ZoomInfoManager {
        if (!ZoomInfoManager.instance) {
            ZoomInfoManager.instance = new ZoomInfoManager();
        }

        return ZoomInfoManager.instance;
    }

    removeZoomInfo(label: string) {
        const file = this.getZoomInfoFile();
        let existingData: ZoomInfo[] = getFileDataAsJson(file);
        if (!existingData) {
            return;
        }
        const idx = existingData.findIndex((n: ZoomInfo) => n.name === label);
        if (idx !== -1) {
            // remove the item
            existingData.splice(idx, 1);

            // save it
            writeJsonData(existingData, file);
        } else {
            window.showErrorMessage(
                `Unable to find zoom name '${label}' to delete`
            );
        }

        commands.executeCommand("zoomtime.refreshTree");
    }

    editZoomInfoFile() {
        // open the json document in the editor
        openFileInEditor(this.getZoomInfoFile());
    }

    async showAddZoomInfoFlow() {
        // link prompt
        let zoomLink = await this.promptForLink();
        if (!zoomLink) {
            return;
        }

        zoomLink = zoomLink.trim();

        // name prompt
        let zoomName = await this.promptForName();

        if (!zoomName) {
            return;
            window.showInformationMessage(
                "Please enter a zoom bookmark name to continue"
            );
        }

        zoomName = zoomName.trim();

        // add it
        const zoomInfo: ZoomInfo = new ZoomInfo();
        zoomInfo.link = zoomLink;
        zoomInfo.name = zoomName;
        this.addZoomInfo(zoomInfo);
        commands.executeCommand("zoomtime.refreshTree");
    }

    private async promptForName() {
        return await this.launchInputBox(
            "Assign a name to the meeting",
            "Please enter a non-empty name to continue."
        );
    }

    private async promptForLink() {
        return await this.launchInputBox(
            "Enter a Zoom link",
            "Please enter a valid and non-empty link to continue.",
            true
        );
    }

    private launchInputBox(
        placeHolder: string,
        usageMsg: string,
        isUrl: boolean = false
    ) {
        return window.showInputBox({
            value: "",
            placeHolder,
            validateInput: text => {
                if (isUrl) {
                    if (!text || !isValidUrl(text)) {
                        return usageMsg;
                    }
                } else if (!text) {
                    return usageMsg;
                }
                return null;
            }
        });
    }

    getZoomInfoFile() {
        let file = getSoftwareDir();
        if (isWindows()) {
            file += "\\zoomInfo.json";
        } else {
            file += "/zoomInfo.json";
        }
        return file;
    }

    getZoomInfoList(): ZoomInfo[] {
        const file = this.getZoomInfoFile();
        let existingData: ZoomInfo[] = getFileDataAsJson(file);
        if (!existingData) {
            return [];
        }
        return existingData;
    }

    addZoomInfo(info: ZoomInfo) {
        const file = this.getZoomInfoFile();

        // get the current data (array based)
        let existingData: ZoomInfo[] = getFileDataAsJson(file);

        if (!existingData) {
            existingData = [];
        }

        // check to make suer the link doesn't already exist
        if (Object.keys(existingData).length) {
            const linkExists = existingData.find(
                (n: ZoomInfo) => n.name === info.name
            );
            if (linkExists) {
                window.showErrorMessage("Meeting name already exists");
                return;
            }
        }

        // it doesn't exist, add it
        existingData.push(info);

        // save it
        writeJsonData(existingData, file);
    }
}
