import * as vscode from "vscode";
import { ThoughtPad } from "./thoughtPad";
import { ThoughtsDataProvider } from "./thoughtsDataProvider";

export function activate(context: vscode.ExtensionContext) {
	const tdp = new ThoughtsDataProvider();
	const tp = new ThoughtPad(tdp);

	// Seed the data provider
	tdp.updateThoughts(tp.loadThoughts());

	// and register our TreeDataProvider
	vscode.window.registerTreeDataProvider("thoughts-tree", tdp);

	// register commands
	context.subscriptions.push(
		vscode.commands.registerCommand("thoughtpad.captureThought", () => {
			tp.captureThought();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("thoughtpad.copyEntry", (entry) => {
			tp.copyEntry(entry);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("thoughtpad.deleteEntry", (entry) => {
			tp.deleteEntry(entry);
		})
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
