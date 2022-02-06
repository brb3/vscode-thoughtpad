import * as vscode from "vscode";

export class ThoughtTreeItem extends vscode.TreeItem {
	children: ThoughtTreeItem[] | undefined;

	constructor(label: string, id: string, date: Date | undefined, children?: ThoughtTreeItem[]) {
		super(
			label,
			children === undefined
				? vscode.TreeItemCollapsibleState.None
				: vscode.TreeItemCollapsibleState.Expanded
		);
		this.children = children;

		this.id = id;

		if (!children) {
			this.contextValue = "thoughtTreeItem";
		}

		if (date) {
			this.tooltip = new Date(date).toString();
		}
	}
}
