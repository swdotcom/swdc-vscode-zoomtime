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
import {
    getSubmitFeedbackButton,
    getManageBookmarksButton,
    getLearnMoreButton,
    getDividerButton
} from "./TreeButtonManager";
import { ZoomInfo } from "../models/ZoomInfo";
import { ZoomInfoManager } from "../managers/ZoomInfoManager";
import { launchUrl } from "../utils/Util";

const zoomCollapsedStateMap: any = {};

export const connectZoomMenuTreeView = (view: TreeView<TreeNode>) => {
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

export class TreeMenuProvider implements TreeDataProvider<TreeNode> {
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
            nodeItems = await this.getZoomMenuParents();
        }
        return nodeItems;
    }

    async getZoomMenuParents(): Promise<TreeNode[]> {
        const treeItems: TreeNode[] = [];
        // get the manage bookmarks button
        const manageBookmarksButton: TreeNode = getManageBookmarksButton();
        treeItems.push(manageBookmarksButton);

        // get the learn more button
        const learnMoreButton: TreeNode = getLearnMoreButton();
        treeItems.push(learnMoreButton);

        // get the submit feedback button
        const feedbackButton: TreeNode = getSubmitFeedbackButton();
        treeItems.push(feedbackButton);

        // get the divider
        const dividerButton: TreeNode = getDividerButton();
        treeItems.push(dividerButton);

        const zoomInfoList: ZoomInfo[] = ZoomInfoManager.getInstance().getZoomInfoList();

        zoomInfoList.sort((a: ZoomInfo, b: ZoomInfo) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
        });

        const bookmarkItems: TreeNode[] = zoomInfoList.map((info: ZoomInfo) => {
            // parent
            const node: TreeNode = new TreeNode();
            node.label = info.name;
            node.tooltip = info.link;

            const children: TreeNode[] = [];
            // link child
            const linkNode: TreeNode = new TreeNode();
            linkNode.label = info.link;
            linkNode.value = info.link;
            linkNode.icon = "rocket-grey.png";
            children.push(linkNode);

            node.children = children;

            return node;
        });

        treeItems.push(...bookmarkItems);

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
