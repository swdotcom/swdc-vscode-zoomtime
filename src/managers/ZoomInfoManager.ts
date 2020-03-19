import { ZoomInfo } from "../models/ZoomInfo";
import {
    getFileDataAsJson,
    writeJsonData,
    getSoftwareDir
} from "../utils/FileUtil";
import { window, commands } from "vscode";
import { isWindows } from "../utils/Util";
const open = require("open");

export class ZoomInfoManager {
    private static instance: ZoomInfoManager;

    constructor() {}

    static getInstance(): ZoomInfoManager {
        if (!ZoomInfoManager.instance) {
            ZoomInfoManager.instance = new ZoomInfoManager();
        }

        return ZoomInfoManager.instance;
    }

    launchZoomInfoLink(link: string) {
        open(link);
    }

    removeZoomInfo(link: string) {
        const file = this.getZoomInfoFile();
        let existingData: ZoomInfo[] = getFileDataAsJson(file);
        if (!existingData) {
            return;
        }
        const idx = existingData.findIndex((n: ZoomInfo) => n.link === link);
        if (idx !== -1) {
            // remove the item
            existingData.splice(idx, 1);

            // save it
            writeJsonData(existingData, file);

            commands.executeCommand("zoomtime.refreshZoomLinks");
        }
    }

    async showAddZoomInfoFlow() {
        // launch the input
        const zoomAlias = await this.launchInputBox(
            "Enter zoom link alias",
            "Please enter a non-empty zoom alias to continue."
        );

        if (zoomAlias) {
            // now ask for the link
            const zoomLink = await this.launchInputBox(
                "Enter zoom link",
                "Please enter a non-empty zoom link to continue."
            );

            if (zoomLink) {
                const zoomInfo: ZoomInfo = new ZoomInfo();
                zoomInfo.link = zoomLink;
                zoomInfo.alias = zoomAlias;
                this.addZoomInfo(zoomInfo);
                commands.executeCommand("zoomtime.refreshZoomLinks");
            }
        }
    }

    launchInputBox(placeHolder: string, usageMsg: string) {
        return window.showInputBox({
            value: "",
            placeHolder,
            validateInput: text => {
                return !text ? usageMsg : null;
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
