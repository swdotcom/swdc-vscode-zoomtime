import { Disposable, commands, window, TreeView } from "vscode";
import {
    TreeItemProvider,
    connectZoomTreeView
} from "../tree/TreeItemProvider";
import { TreeNode } from "../models/TreeNode";

export function createCommands(): { dispose: () => void } {
    let cmds: any[] = [];

    // zoom tree view
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

    return Disposable.from(...cmds);
}
