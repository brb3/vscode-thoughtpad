import * as vscode from "vscode";
import { Day } from "./interfaces";
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

	updateThoughts(days: Day[]): void {
		this.data = [] as ThoughtTreeItem[];
		days.forEach((d) => {
			const formattedDate = new Date(d.timestamp).toDateString();
			this.data.push(
				new ThoughtTreeItem(
					formattedDate,
					"",
					undefined,
					d.thoughts.map((t) => new ThoughtTreeItem(t.message, t.id, t.timestamp, undefined))
				)
			);
		});
		this._onDidChangeTreeData.fire();
	}
}
