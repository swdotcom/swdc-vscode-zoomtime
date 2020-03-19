import { ZoomInfo } from "../models/ZoomInfo";
import {
    getFileDataAsJson,
    writeJsonData,
    getSoftwareDir
} from "../utils/FileUtil";
import { window, commands } from "vscode";
import { isWindows } from "../utils/Util";

export class ZoomInfoManager {
    private static instance: ZoomInfoManager;

    constructor() {}

    static getInstance(): ZoomInfoManager {
        if (!ZoomInfoManager.instance) {
            ZoomInfoManager.instance = new ZoomInfoManager();
        }

        return ZoomInfoManager.instance;
    }

    async showAddZoomInfoFlow() {
        // launch the input
        const zoomLink = await window.showInputBox({
            value: "",
            placeHolder: "Enter a zoom link",
            validateInput: text => {
                return !text
                    ? "Please enter a non-empty zoom link to continue."
                    : null;
            }
        });
        if (zoomLink) {
            const zoomInfo: ZoomInfo = new ZoomInfo();
            zoomInfo.link = zoomLink;
            this.addZoomInfo(zoomInfo);
            commands.executeCommand("zoomtime.refreshZoomLinks");
        }
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
                (n: ZoomInfo) => n.link === info.link
            );
            if (linkExists) {
                window.showErrorMessage("Link already exists");
                return;
            }
        }

        // it doesn't exist, add it
        existingData.push(info);

        // save it
        writeJsonData(existingData, file);
    }
}
