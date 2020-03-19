import { TreeNode } from "../models/TreeNode";

export class TreeNodeManager {
    private static instance: TreeNodeManager;

    constructor() {
        //
    }

    static getInstance(): TreeNodeManager {
        if (!TreeNodeManager.instance) {
            TreeNodeManager.instance = new TreeNodeManager();
        }

        return TreeNodeManager.instance;
    }

    async getZoomTreeParents(): Promise<TreeNode[]> {
        const treeItems: TreeNode[] = [];
        return treeItems;
    }

    getActionButton(
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
}
