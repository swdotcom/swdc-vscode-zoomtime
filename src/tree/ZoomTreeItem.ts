import { TreeItem, TreeItemCollapsibleState, Command } from "vscode";
import * as path from "path";
import { TreeNode } from "../models/TreeNode";

const resourcePath: string = path.join(
    __filename,
    "..",
    "..",
    "..",
    "resources"
);

export class ZoomTreeItem extends TreeItem {
    constructor(
        private readonly treeItem: TreeNode,
        public readonly collapsibleState: TreeItemCollapsibleState,
        public readonly command?: Command
    ) {
        super(treeItem.label, collapsibleState);

        const { lightPath, darkPath, contextValue } = getTreeItemIcon(treeItem);
        if (lightPath && darkPath) {
            this.iconPath.light = lightPath;
            this.iconPath.dark = darkPath;
        } else {
            // no matching tag, remove the tree item icon path
            delete this.iconPath;
        }
        this.contextValue = contextValue;
    }

    get tooltip(): string {
        if (!this.treeItem) {
            return "";
        }
        if (this.treeItem.tooltip) {
            return this.treeItem.tooltip;
        } else {
            return this.treeItem.label;
        }
    }

    iconPath = {
        light: "",
        dark: ""
    };

    contextValue = "treeItem";
}

function getTreeItemIcon(treeItem: TreeNode): any {
    const iconName = treeItem.icon;
    const lightPath =
        iconName && treeItem.children.length === 0
            ? path.join(resourcePath, "light", iconName)
            : null;
    const darkPath =
        iconName && treeItem.children.length === 0
            ? path.join(resourcePath, "dark", iconName)
            : null;
    const contextValue = treeItem.contextValue;
    return { lightPath, darkPath, contextValue };
}
