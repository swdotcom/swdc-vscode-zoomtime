import { Disposable, commands, window, TreeView } from "vscode";
import {
    TreeItemProvider,
    connectZoomTreeView
} from "../tree/TreeItemProvider";
import { TreeNode } from "../models/TreeNode";

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

    // ZOOM LINK ADD BUTTON
    cmds.push(
        commands.registerCommand("zoomtime.addZoomLink", () => {
            //
        })
    );

    return Disposable.from(...cmds);
}
