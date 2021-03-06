import { TreeNode } from "../models/TreeNode";

export function getActionButton(
    label: string,
    tooltip: string,
    command: string,
    icon: any = null,
    eventDescription: string = ""
): TreeNode {
    const item: TreeNode = new TreeNode();
    item.tooltip = tooltip;
    item.label = label;
    item.id = label;
    item.command = command;
    item.icon = icon;
    item.contextValue = "action_button";
    item.eventDescription = eventDescription;
    return item;
}

export function getDividerButton() {
    return getActionButton("", "", "", "blue-line-96.png");
}

export function getSubmitFeedbackButton() {
    return getActionButton(
        "Submit feedback",
        "Send us an email at cody@software.com",
        "zoomtime.sendFeedback",
        "message.svg"
    );
}

export function getLearnMoreButton() {
    return getActionButton(
        "Learn more",
        "View the Code Time Readme to learn more",
        "zoomtime.displayReadme",
        "readme.png"
    );
}

export function getManageBookmarksButton() {
    return getActionButton(
        "Manage bookmarks",
        "",
        "zoomtime.manageBookmarks",
        "settings.png"
    );
}

export function getConnectZoomButton() {
    return getActionButton(
        "Connect Zoom",
        "",
        "zoomtime.connectZoom",
        "zoom.png"
    );
}

export function getZoomConnectedButton() {
    return getActionButton("Zoom connected", "", "", "zoom.png");
}

export function getNoBookmarksButton() {
    return getActionButton("Add a bookmark", "", "zoomtime.addZoomLink", "");
}

export function getNoMeetingsButton() {
    return getActionButton(
        "Create a meeting",
        "",
        "zoomtime.createZoomMeeting",
        ""
    );
}

export function getConnectZoomInfoButton() {
    return getActionButton(
        "Connect Zoom to see or create meetings",
        "",
        "zoomtime.connectZoom",
        ""
    );
}
