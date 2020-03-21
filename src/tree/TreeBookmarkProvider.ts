import {
    TreeDataProvider,
    TreeItemCollapsibleState,
    EventEmitter,
    Event,
    Disposable,
    TreeView,
    commands
} from "vscode";
import { TreeNode } from "../models/TreeNode";
import { ZoomTreeItem } from "./ZoomTreeItem";
import { ZoomInfoManager } from "../managers/ZoomInfoManager";
import { ZoomInfo } from "../models/ZoomInfo";
import { launchUrl } from "../utils/Util";
import { getNoBookmarksButton } from "./TreeButtonManager";

const zoomCollapsedStateMap: any = {};

export const connectZoomBookmarkTreeView = (view: TreeView<TreeNode>) => {
    return Disposable.from(
        view.onDidCollapseElement(async e => {
            const item: TreeNode = e.element;
            zoomCollapsedStateMap[item.label] =
                TreeItemCollapsibleState.Collapsed;
        }),

        view.onDidExpandElement(async e => {
            const item: TreeNode = e.element;
            zoomCollapsedStateMap[item.label] =
                TreeItemCollapsibleState.Expanded;
        }),

        view.onDidChangeSelection(async e => {
            if (!e.selection || e.selection.length === 0) {
                return;
            }

            const item: TreeNode = e.selection[0];
            if (item.command) {
                const args = item.commandArgs || null;
                if (args) {
                    commands.executeCommand(item.command, ...args);
                } else {
                    // run the command
                    commands.executeCommand(item.command);
                }
            } else if (item.value) {
                launchUrl(item.value);
                commands.executeCommand("zoomtime.refreshTree");
            }
        }),

        view.onDidChangeVisibility(e => {
            if (e.visible) {
                //
            }
        })
    );
};

export class TreeBookmarkProvider implements TreeDataProvider<TreeNode> {
    private _onDidChangeTreeData: EventEmitter<
        TreeNode | undefined
    > = new EventEmitter<TreeNode | undefined>();

    readonly onDidChangeTreeData: Event<TreeNode | undefined> = this
        ._onDidChangeTreeData.event;

    private view: TreeView<TreeNode> | undefined;

    constructor() {
        //
    }

    bindView(zoomTreeView: TreeView<TreeNode>): void {
        this.view = zoomTreeView;
    }

    getParent(_p: TreeNode) {
        return void 0; // all playlists are in root
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    refreshParent(parent: TreeNode) {
        this._onDidChangeTreeData.fire(parent);
    }

    getTreeItem(p: TreeNode): ZoomTreeItem {
        let treeItem: ZoomTreeItem;
        if (p.children.length) {
            let collasibleState = zoomCollapsedStateMap[p.label];
            if (!collasibleState) {
                treeItem = createZoomTreeItem(p, p.initialCollapsibleState);
            } else {
                treeItem = createZoomTreeItem(p, collasibleState);
            }
        } else {
            treeItem = createZoomTreeItem(p, TreeItemCollapsibleState.None);
        }

        return treeItem;
    }

    async getChildren(element?: TreeNode): Promise<TreeNode[]> {
        let nodeItems: TreeNode[] = [];

        if (element) {
            // return the children of this element
            nodeItems = element.children;
        } else {
            // return the parent elements
            nodeItems = await this.getZoomBookmarkParents();
        }
        return nodeItems;
    }

    async getZoomBookmarkParents(): Promise<TreeNode[]> {
        let treeItems: TreeNode[] = [];
        let zoomInfoList: ZoomInfo[] = ZoomInfoManager.getInstance().getZoomInfoList();

        // filter only bookmark ones
        zoomInfoList = zoomInfoList.filter((n: ZoomInfo) => n.bookmark);

        if (!zoomInfoList || zoomInfoList.length === 0) {
            const noMeetingsButton: TreeNode = getNoBookmarksButton();
            treeItems.push(noMeetingsButton);
            return treeItems;
        }

        zoomInfoList.sort((a: ZoomInfo, b: ZoomInfo) => {
            const nameA = a.topic.toUpperCase();
            const nameB = b.topic.toUpperCase();
            return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
        });

        treeItems = zoomInfoList.map((info: ZoomInfo) => {
            // parent
            const node: TreeNode = new TreeNode();
            node.label = info.topic;
            node.tooltip = info.join_url;
            node.contextValue = "bookmark-parent";

            const children: TreeNode[] = [];
            // link child
            const linkNode: TreeNode = new TreeNode();
            linkNode.label = info.join_url;
            linkNode.value = info.join_url;
            linkNode.icon = "rocket-grey.png";
            linkNode.contextValue = "bookmark-child";
            children.push(linkNode);

            node.children = children;

            return node;
        });
        return treeItems;
    }
}

/**
 * Create the playlist tree item (root or leaf)
 * @param p
 * @param cstate
 */
function createZoomTreeItem(p: TreeNode, cstate: TreeItemCollapsibleState) {
    return new ZoomTreeItem(p, cstate);
}
