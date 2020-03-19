import { TreeNode } from "../models/TreeNode";
import { ZoomInfo } from "../models/ZoomInfo";
import { ZoomInfoManager } from "../managers/ZoomInfoManager";

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
        const zoomInfoList: ZoomInfo[] = ZoomInfoManager.getInstance().getZoomInfoList();

        const treeItems: TreeNode[] = zoomInfoList.map((info: ZoomInfo) => {
            const node: TreeNode = new TreeNode();
            node.label = info.alias;
            node.description = info.link;
            node.value = info.link;
            node.tooltip = info.link;
            return node;
        });
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
