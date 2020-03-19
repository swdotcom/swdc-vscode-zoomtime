// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { createCommands } from "./utils/CommandUtil";
import { displayReadmeIfNotExists } from "./utils/Util";

// this method is called when the extension is activated
export function activate(ctx: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('"zoom-time" is now active');

    // add the code time commands
    ctx.subscriptions.push(createCommands());

    // show the readme if it doesn't exist
    displayReadmeIfNotExists(false, true);
}

// this method is called when your extension is deactivated
export function deactivate() {}
