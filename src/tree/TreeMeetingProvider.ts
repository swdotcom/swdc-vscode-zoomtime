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
import { launchUrl, getItem } from "../utils/Util";
import { ZoomMeetingManager } from "../managers/ZoomMeetingManager";
import { ZoomMeeting } from "../models/ZoomMeeting";
import {
    getNoMeetingsButton,
    getConnectZoomInfoButton
} from "./TreeButtonManager";
import { ZoomInfoManager } from "../managers/ZoomInfoManager";
import { ZoomInfo } from "../models/ZoomInfo";

const zoomCollapsedStateMap: any = {};

export const connectZoomMeetingTreeView = (view: TreeView<TreeNode>) => {
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

export class TreeMeetingProvider implements TreeDataProvider<TreeNode> {
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
            nodeItems = await this.getZoomMeetingParents();
        }
        return nodeItems;
    }

    async getZoomMeetingParents(): Promise<TreeNode[]> {
        let treeItems: TreeNode[] = [];

        // 1st check to see if they've connected zoom. if not, we show an info message
        const accessToken = getItem("zoom_access_token");
        if (!accessToken) {
            const connectZoomInfoButton: TreeNode = getConnectZoomInfoButton();
            treeItems.push(connectZoomInfoButton);
            return treeItems;
        }
        let meetings: ZoomMeeting[] = await ZoomMeetingManager.getInstance().getMeetings();

        let zoomInfoList: ZoomInfo[] = ZoomInfoManager.getInstance().getZoomInfoList();
        // get non-bookmark ones
        zoomInfoList = zoomInfoList.filter((n: ZoomInfo) => !n.bookmark);

        if (!meetings) {
            meetings = [];
        }
        if (zoomInfoList && zoomInfoList.length) {
            // add these
            zoomInfoList.forEach((info: ZoomInfo) => {
                const meeting: ZoomMeeting = new ZoomMeeting();
                meeting.topic = info.topic;
                meeting.join_url = info.join_url;
                meeting.bookmark = true;
                meetings.push(meeting);
            });
        }

        // if no meetings, show an info message
        if (!meetings || meetings.length === 0) {
            const noMeetingsButton: TreeNode = getNoMeetingsButton();
            treeItems.push(noMeetingsButton);
            return treeItems;
        }

        // sort the meetings
        meetings.sort((a: ZoomMeeting, b: ZoomMeeting) => {
            const nameA = a.topic.toUpperCase();
            const nameB = b.topic.toUpperCase();
            return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
        });

        treeItems = meetings.map((info: ZoomMeeting) => {
            // parent
            const node: TreeNode = new TreeNode();
            node.label = info.topic;
            node.tooltip = info.join_url;
            if (info.bookmark) {
                node.contextValue = "bookmark-parent";
            }

            const children: TreeNode[] = [];
            // link child
            const linkNode: TreeNode = new TreeNode();
            linkNode.label = info.join_url;
            linkNode.value = info.join_url;
            linkNode.icon = "rocket-grey.png";
            if (info.bookmark) {
                linkNode.contextValue = "bookmark-child";
            }
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
