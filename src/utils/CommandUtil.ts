import { Disposable, commands, window, TreeView } from "vscode";
import { TreeNode } from "../models/TreeNode";
import { ZoomInfoManager } from "../managers/ZoomInfoManager";
import { DocListenManager } from "../managers/DocListenManager";
import {
    TreeMenuProvider,
    connectZoomMenuTreeView
} from "../tree/TreeMenuProvider";
import { launchUrl, displayReadmeIfNotExists, connectZoom } from "./Util";
import {
    TreeBookmarkProvider,
    connectZoomBookmarkTreeView
} from "../tree/TreeBookmarkProvider";
import {
    TreeMeetingProvider,
    connectZoomMeetingTreeView
} from "../tree/TreeMeetingProvider";
import { ZoomMeetingManager } from "../managers/ZoomMeetingManager";

export function createCommands(): { dispose: () => void } {
    let cmds: any[] = [];

    // MENU TREE
    const menuProvider = new TreeMenuProvider();
    const zoomMenuTreeView: TreeView<TreeNode> = window.createTreeView(
        "zoom-menu-tree",
        {
            treeDataProvider: menuProvider,
            showCollapseAll: false
        }
    );
    menuProvider.bindView(zoomMenuTreeView);
    cmds.push(connectZoomMenuTreeView(zoomMenuTreeView));

    // BOOKMARKS TREE
    const bookmarkProvider = new TreeBookmarkProvider();
    const zoomBookmarkTreeView: TreeView<TreeNode> = window.createTreeView(
        "zoom-bookmark-tree",
        {
            treeDataProvider: bookmarkProvider,
            showCollapseAll: true
        }
    );
    bookmarkProvider.bindView(zoomBookmarkTreeView);
    cmds.push(connectZoomBookmarkTreeView(zoomBookmarkTreeView));

    // MEETINGS TREE
    const meetingsProvider = new TreeMeetingProvider();
    const zoomMeetingsTreeView: TreeView<TreeNode> = window.createTreeView(
        "zoom-meeting-tree",
        {
            treeDataProvider: meetingsProvider,
            showCollapseAll: true
        }
    );
    meetingsProvider.bindView(zoomMeetingsTreeView);
    cmds.push(connectZoomMeetingTreeView(zoomMeetingsTreeView));

    // CONNECT CMD
    cmds.push(
        commands.registerCommand("zoomtime.connectZoom", () => {
            connectZoom();
        })
    );

    // REVEAL TREE CMD
    cmds.push(
        commands.registerCommand("zoomtime.displayTree", () => {
            menuProvider.revealTree();
        })
    );

    // INIT THE DOCUMENT LISTENER
    DocListenManager.getInstance();

    // ADD BOOKMARK CMD
    cmds.push(
        commands.registerCommand("zoomtime.addZoomLink", () => {
            ZoomInfoManager.getInstance().initiateAddZoomInfoFlow();
        })
    );

    // ADD MEETING CMD
    cmds.push(
        commands.registerCommand("zoomtime.createZoomMeeting", () => {
            ZoomMeetingManager.getInstance().initiateCreateMeetingFlow();
        })
    );

    // REFRESH ALL TREES
    cmds.push(
        commands.registerCommand("zoomtime.refreshTree", () => {
            menuProvider.refresh();
            bookmarkProvider.refresh();
            meetingsProvider.refresh();
        })
    );

    // REFRESH BOOKMARK TREE
    cmds.push(
        commands.registerCommand("zoomtime.refreshBookmarkTree", () => {
            bookmarkProvider.refresh();
        })
    );

    // REFRESH MEETING TREE
    cmds.push(
        commands.registerCommand("zoomtime.refreshMeetingTree", () => {
            meetingsProvider.refresh();
        })
    );

    // REMOVE CMD
    cmds.push(
        commands.registerCommand(
            "zoomtime.removeZoomLink",
            (item: TreeNode) => {
                ZoomInfoManager.getInstance().removeZoomInfo(item.label);
            }
        )
    );

    // EDIT CMD
    cmds.push(
        commands.registerCommand("zoomtime.editZoomLink", (item: TreeNode) => {
            ZoomInfoManager.getInstance().editZoomInfoFile();
        })
    );

    // SUBMIT FEEDBACK CMD
    cmds.push(
        commands.registerCommand("zoomtime.sendFeedback", () => {
            launchUrl("mailto:cody@software.com");
            commands.executeCommand("zoomtime.refreshTree");
        })
    );

    // LEARN MORE CMD
    cmds.push(
        commands.registerCommand("zoomtime.displayReadme", () => {
            displayReadmeIfNotExists(true /*override*/);
            commands.executeCommand("zoomtime.refreshTree");
        })
    );

    // MANAGE BOOKMARKS CMD
    cmds.push(
        commands.registerCommand("zoomtime.manageBookmarks", () => {
            ZoomInfoManager.getInstance().editZoomInfoFile();
            commands.executeCommand("zoomtime.refreshTree");
        })
    );

    return Disposable.from(...cmds);
}
