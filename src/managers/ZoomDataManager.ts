import { zoomGet } from "./HttpManager";
import { ZoomMeeting } from "../models/ZoomMeeting";

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
}
