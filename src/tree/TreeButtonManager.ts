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

export function getSubmitFeedbackButtion() {
    return getActionButton(
        "Submit feedback",
        "Send us an email at cody@software.com",
        "zoomtime.sendFeedback",
        "message.svg"
    );
}
