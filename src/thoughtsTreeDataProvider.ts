import * as vscode from "vscode";
import { DatedThoughts } from "./interfaces";
import { ThoughtTreeItem } from "./thoughtTreeItem";

export class ThoughtsTreeDataProvider implements vscode.TreeDataProvider<ThoughtTreeItem> {
	constructor() {
		this.data = [];
	 }

	private _onDidChangeTreeData: vscode.EventEmitter<ThoughtTreeItem | undefined | null | void> =
		new vscode.EventEmitter<ThoughtTreeItem | undefined | null | void>();

	readonly onDidChangeTreeData: vscode.Event<ThoughtTreeItem | undefined | null | void> =
		this._onDidChangeTreeData.event;

	private data: ThoughtTreeItem[];

	getTreeItem(element: ThoughtTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}
	getChildren(element?: ThoughtTreeItem): vscode.ProviderResult<ThoughtTreeItem[]> {
		if (!element) {
			return this.data;
		}

		return element.children;
	}

	updateThoughts(datedThoughts: DatedThoughts[]): void {
		this.data = [] as ThoughtTreeItem[];
		datedThoughts.forEach((d) => {
			this.data.push(
				new ThoughtTreeItem(
					d.day,
					"",
					undefined,
					d.thoughts.map((t) => new ThoughtTreeItem(t.message, t.id, t.timestamp, undefined))
				)
			);
		});
		this._onDidChangeTreeData.fire();
	}
}
