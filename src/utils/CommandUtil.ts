import { Disposable, commands, window, TreeView } from "vscode";
import {
    TreeBookmarkProvider,
    connectZoomBookmarkTreeView
} from "../tree/TreeBookmarkProvider";
import { TreeNode } from "../models/TreeNode";
import { ZoomInfoManager } from "../managers/ZoomInfoManager";
import { DocListenManager } from "../managers/DocListenManager";
import {
    TreeMenuProvider,
    connectZoomMenuTreeView
} from "../tree/TreeMenuProvider";
import { launchUrl, displayReadmeIfNotExists } from "./Util";

export function createCommands(): { dispose: () => void } {
    let cmds: any[] = [];

    // ZOOM BOOKMARK TREE
    const bookmarkProvider = new TreeBookmarkProvider();
    const zoomBookmarkTreeView: TreeView<TreeNode> = window.createTreeView(
        "zoom-bookmark-tree",
        {
            treeDataProvider: bookmarkProvider,
            showCollapseAll: false
        }
    );
    bookmarkProvider.bindView(zoomBookmarkTreeView);
    cmds.push(connectZoomBookmarkTreeView(zoomBookmarkTreeView));

    // ZOOM MENU TREE
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

    // INIT THE DOCUMENT LISTENER
    DocListenManager.getInstance();

    // ZOOM LINK ADD BUTTON CMD
    cmds.push(
        commands.registerCommand("zoomtime.addZoomLink", () => {
            ZoomInfoManager.getInstance().showAddZoomInfoFlow();
        })
    );

    // ZOOM TREE REFRESH CMD
    cmds.push(
        commands.registerCommand("zoomtime.refreshZoomLinks", () => {
            bookmarkProvider.refresh();
        })
    );

    // ZOOM LINK REMOVE CMD
    cmds.push(
        commands.registerCommand(
            "zoomtime.removeZoomLink",
            (item: TreeNode) => {
                ZoomInfoManager.getInstance().removeZoomInfo(item.label);
            }
        )
    );

    // ZOOM LINK EDIT CMD
    cmds.push(
        commands.registerCommand("zoomtime.editZoomLink", (item: TreeNode) => {
            ZoomInfoManager.getInstance().editZoomInfoFile();
        })
    );

    // SUBMIT FEEDBACK CMD
    cmds.push(
        commands.registerCommand("zoomtime.sendFeedback", () => {
            launchUrl("mailto:cody@software.com");
        })
    );

    // LEARN MORE CMD
    cmds.push(
        commands.registerCommand("zoomtime.displayReadme", () => {
            displayReadmeIfNotExists(true /*override*/);
        })
    );

    // MANAGE BOOKMARKS CMD
    cmds.push(
        commands.registerCommand("zoomtime.manageBookmarks", () => {
            ZoomInfoManager.getInstance().editZoomInfoFile();
        })
    );

    return Disposable.from(...cmds);
}
