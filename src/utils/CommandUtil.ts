import { Disposable, commands, window, TreeView } from "vscode";
import {
    TreeItemProvider,
    connectZoomTreeView
} from "../tree/TreeItemProvider";
import { TreeNode } from "../models/TreeNode";
import { ZoomInfoManager } from "../managers/ZoomInfoManager";

export function createCommands(): { dispose: () => void } {
    let cmds: any[] = [];

    // ZOOM TREE
    const provider = new TreeItemProvider();
    const zoomTreeView: TreeView<TreeNode> = window.createTreeView(
        "zoom-tree",
        {
            treeDataProvider: provider,
            showCollapseAll: false
        }
    );
    provider.bindView(zoomTreeView);
    cmds.push(connectZoomTreeView(zoomTreeView));

    // ZOOM LINK ADD BUTTON CMD
    cmds.push(
        commands.registerCommand("zoomtime.addZoomLink", () => {
            ZoomInfoManager.getInstance().showAddZoomInfoFlow();
        })
    );

    // ZOOM TREE REFRESH CMD
    cmds.push(
        commands.registerCommand("zoomtime.refreshZoomLinks", () => {
            provider.refresh();
        })
    );

    // ZOOM LINK REMOVE CMD
    cmds.push(
        commands.registerCommand(
            "zoomtime.removeZoomLink",
            (item: TreeNode) => {
                ZoomInfoManager.getInstance().removeZoomInfo(item.value);
            }
        )
    );

    // ZOOM LINK EDIT CMD
    cmds.push(
        commands.registerCommand("zoomtime.editZoomLink", (item: TreeNode) => {
            ZoomInfoManager.getInstance().editZoomInfoFile();
        })
    );

    return Disposable.from(...cmds);
}
