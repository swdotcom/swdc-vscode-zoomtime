import { zoomGet, zoomPost } from "./HttpManager";
import { ZoomMeeting } from "../models/ZoomMeeting";
import { ZoomMeetingInfo } from "../models/ZoomMeetingInfo";
import { commands } from "vscode";
import { ZoomInfoManager } from "./ZoomInfoManager";
import { ZoomInfo } from "../models/ZoomInfo";
import { launchInputBox } from "../utils/Util";

export class ZoomMeetingManager {
    private static instance: ZoomMeetingManager;

    constructor() {}

    static getInstance(): ZoomMeetingManager {
        if (!ZoomMeetingManager.instance) {
            ZoomMeetingManager.instance = new ZoomMeetingManager();
        }

        return ZoomMeetingManager.instance;
    }

    async getMeetings(): Promise<ZoomMeeting[]> {
        let meetings: ZoomMeeting[] = [];
        // logged on, fetch the meetings
        const api = "/users/me/meetings";
        const resultData = await zoomGet(api);
        if (resultData && resultData.data) {
            meetings = resultData.data.meetings;
        }

        return meetings;
    }

    async initiateCreateMeetingFlow() {
        let topic = await this.promptForTopic();
        if (!topic) {
            return;
        }

        let agenda = await this.promptForAgenda();
        if (!agenda) {
            return;
        }
        return await this.createMeeting(topic.trim(), agenda.trim());
    }

    private async promptForTopic() {
        return await launchInputBox(
            "Assign a topic to the meeting",
            "Please enter a non-empty topic to continue."
        );
    }

    private async promptForAgenda() {
        return await launchInputBox(
            "Assign an agenda to the meeting",
            "Please enter a non-empty agenda to continue."
        );
    }

    async createMeeting(topic: string, agenda: string) {
        let meetingInfo: ZoomMeetingInfo = new ZoomMeetingInfo();
        // type => 1 = instant, 2 = scheduled, 3 = recurring w/ no fixed time, 4 = recurring w/ fixed time
        const payload = {
            topic,
            type: 1 /* instant */,
            duration: 60 /* minutes */,
            agenda,
            settings: {
                approval_type: 0 /* automatically approve */,
                enforce_login: false,
                meeting_authentication: false
            }
        };

        const api = "/users/me/meetings";
        const resultData = await zoomPost(api, payload);

        if (resultData && resultData.data) {
            meetingInfo = resultData.data;
            commands.executeCommand("zoomtime.refreshMeetingTree");

            // create a bookmark out of it
            const zoomInfo: ZoomInfo = new ZoomInfo();
            zoomInfo.join_url = meetingInfo.join_url;
            zoomInfo.topic = meetingInfo.topic;
            zoomInfo.bookmark = false;
            ZoomInfoManager.getInstance().addZoomInfo(zoomInfo);
            // since it's a non-bookmark, refresh the meetings section
            commands.executeCommand("zoomtime.refreshMeetingTree");
        }
        return meetingInfo;
    }
}
