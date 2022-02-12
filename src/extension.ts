import * as vscode from "vscode";
import { ThoughtPad } from "./thoughtPad";
import { ThoughtsTreeDataProvider } from "./thoughtsTreeDataProvider";

export async function activate(context: vscode.ExtensionContext) {
	const ttdp = new ThoughtsTreeDataProvider();
	const app = new ThoughtPad(ttdp, context);

	// Seed the data provider
	ttdp.updateThoughts(await app.loadData());

	// and register our TreeDataProvider
	vscode.window.registerTreeDataProvider("thoughts-tree", ttdp);

	// register commands
	context.subscriptions.push(
		vscode.commands.registerCommand("thoughtpad.captureThought", () => {
			app.captureThought();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("thoughtpad.copyEntry", (entry) => {
			app.copyEntry(entry);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("thoughtpad.deleteEntry", (entry) => {
			app.deleteEntry(entry);
		})
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
