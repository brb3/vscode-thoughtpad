import * as vscode from "vscode";
import { ThoughtsTreeDataProvider } from "./thoughtsTreeDataProvider";
import { Day, Thought, ThoughtsFile } from "./interfaces";
import { v4 as uuidv4 } from "uuid";
import { TextEncoder } from "util";

export class ThoughtPad {
	constructor(treeView: ThoughtsTreeDataProvider, context: vscode.ExtensionContext) {
		this.storageDir = context.globalStorageUri;
		this.tree = treeView;
	}
	storageDir: vscode.Uri;
	tree: ThoughtsTreeDataProvider;
	days = [] as Day[];

	// Captures a Thought
	// Opens a dialog for the user to enter a thought, then adds it to the data and calls saveData()
	async captureThought(): Promise<void> {
		const message = await vscode.window.showInputBox({
			title: "Thought to record",
			ignoreFocusOut: true,
		});

		if (message) {
			const now = new Date();
			let thought = {
				id: uuidv4(),
				timestamp: now, 
				message,
			} as Thought;

			let daysIndex = this.days.findIndex((d) => this.sameDay(new Date(d.timestamp), thought.timestamp));
			if (daysIndex < 0) {
				this.days.push({
					timestamp: now,
					thoughts: [thought],
				} as Day);
			} else {
				this.days[daysIndex].thoughts.push(thought);
			}

			this.saveData();
		} else {
			vscode.window.showWarningMessage("No thought provided.");
		}
	}

	// Copies an entry (thought) message into the system clipboard.
	async copyEntry(entry: any): Promise<void> {
		if (entry) {
			this.days.forEach((dt) => {
				const index = dt.thoughts.findIndex((t) => {
					return t.id === entry.id;
				});
				if (index >= 0) {
					vscode.env.clipboard.writeText(dt.thoughts[index].message);
				}
			});
		}
	}

	// Deletes an entry (thought) from the data and calls saveData()
	async deleteEntry(entry: any): Promise<void> {
		if (entry) {
			vscode.window
				.showInformationMessage("Are you sure you want to delete this entry?", ...["Yes", "No"])
				.then((a) => {
					if (a === "Yes") {
						this.days.forEach((dt, dti) => {
							const index = dt.thoughts.findIndex((t) => {
								return t.id === entry.id;
							});
							if (index >= 0) {
								dt.thoughts.splice(index, 1);
							}

							// If removing this item reduces the size of dt to 0, remove it too
							if (dt.thoughts.length === 0) {
								this.days.splice(dti, 1);
							}
						});

						this.saveData();
					}
				});
		}
	}

	// Creates the storage file if one does not exist, returns the location.
	async getThoughtsFileUri(): Promise<vscode.Uri> {
		// Check if our storage directory exists.
		try {
			await vscode.workspace.fs.readDirectory(this.storageDir);
		} catch {
			// Unable to open directory. Create it.
			await vscode.workspace.fs.createDirectory(this.storageDir);
		}

		const thoughtsFile = vscode.Uri.joinPath(this.storageDir, 'data.json');

		// Check if the storage file itself exists
		try {
			await vscode.workspace.fs.stat(thoughtsFile);
		} catch {
			await vscode.workspace.fs.writeFile(
				thoughtsFile,
				new TextEncoder().encode(JSON.stringify({ dates: [] }, undefined, "\t"))
			);
		}

		return thoughtsFile;
	}

	// Loads the Thoughts into our data property and return the data.
	async loadData(): Promise<Day[]> {
		const dataFile = await this.getThoughtsFileUri();
		const data = await vscode.workspace.fs.readFile(dataFile);
		const jsonData = JSON.parse(data.toString()) as ThoughtsFile;
		this.days = jsonData.dates;

		return this.days;
	}

	// Writes the data into the Thoughts file
	async saveData(): Promise<void> {
		let data = {
			dates: this.days,
		} as ThoughtsFile;

		await vscode.workspace.fs.writeFile(
			await this.getThoughtsFileUri(),
			new TextEncoder().encode(JSON.stringify(data, undefined, '\t')));

		this.tree.updateThoughts(this.days);
	}

	sameDay(a: Date, b: Date): boolean {
		return (
			a.getDate() === b.getDate() &&
			a.getMonth() === b.getMonth() &&
			a.getFullYear() === b.getFullYear()
		);
	}
}
