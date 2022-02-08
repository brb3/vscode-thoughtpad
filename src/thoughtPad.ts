import * as vscode from "vscode";
import { ThoughtsDataProvider } from "./thoughtsDataProvider";
import { DatedThoughts, Thought, ThoughtsFile } from "./interfaces";
import { v4 as uuidv4 } from "uuid";
import { TextEncoder } from "util";

export class ThoughtPad {
	constructor(treeView: ThoughtsDataProvider, context: vscode.ExtensionContext) {
		this.storageDir = context.globalStorageUri;
		this.tree = treeView;
	}
	storageDir: vscode.Uri;
	tree: ThoughtsDataProvider;
	thoughts = [] as DatedThoughts[];

	// Captures a Thought
	// Opens a dialog for the user to enter a thought, then adds it to the data and calls writeThoughts()
	async captureThought(): Promise<void> {
		const message = await vscode.window.showInputBox({
			title: "Thought to record",
			ignoreFocusOut: true,
		});

		if (message) {
			let thought = {
				id: uuidv4(),
				timestamp: new Date(),
				message,
			} as Thought;

			const day = thought.timestamp.toISOString().slice(0, 10);

			let datedThoughtIndex = this.thoughts.findIndex((dt) => dt.day === day);
			if (datedThoughtIndex < 0) {
				this.thoughts.push({
					day,
					thoughts: [thought],
				});
			} else {
				this.thoughts[datedThoughtIndex].thoughts.push(thought);
			}

			this.writeThoughts();
		} else {
			vscode.window.showWarningMessage("No thought provided.");
		}
	}

	// Copies an entry (thought) message into the system clipboard.
	async copyEntry(entry: any): Promise<void> {
		if (entry) {
			this.thoughts.forEach((dt) => {
				const index = dt.thoughts.findIndex((t) => {
					return t.id === entry.id;
				});
				if (index >= 0) {
					vscode.env.clipboard.writeText(dt.thoughts[index].message);
				}
			});
		}
	}

	// Deletes an entry (thought) from the data and calls writeThoughts()
	async deleteEntry(entry: any): Promise<void> {
		if (entry) {
			vscode.window
				.showInformationMessage("Are you sure you want to delete this entry?", ...["Yes", "No"])
				.then((a) => {
					if (a === "Yes") {
						this.thoughts.forEach((dt, dti) => {
							const index = dt.thoughts.findIndex((t) => {
								return t.id === entry.id;
							});
							if (index >= 0) {
								dt.thoughts.splice(index, 1);
							}

							// If removing this item reduces the size of dt to 0, remove it too
							if (dt.thoughts.length === 0) {
								this.thoughts.splice(dti, 1);
							}
						});

						this.writeThoughts();
					}
				});
		}
	}

	// Creates the storage file if one does not exist, returns the location.
	async getThoughtsFile(): Promise<vscode.Uri> {
		// Check if our storage directory exists.
		try {
			await vscode.workspace.fs.readDirectory(this.storageDir);
		} catch {
			// Unable to open directory. Create it.
			await vscode.workspace.fs.createDirectory(this.storageDir);
		}

		return vscode.Uri.joinPath(this.storageDir, 'data.json');
	}

	// Loads the Thoughts into our data property and return the data.
	async loadThoughts(): Promise<DatedThoughts[]> {
		const dataFile = await this.getThoughtsFile();
		try {
			const data = await vscode.workspace.fs.readFile(dataFile);
			const jsonData = JSON.parse(data.toString()) as ThoughtsFile;
			this.thoughts = jsonData.dates;
		} catch {
			// No data file currently exists. Create a new one.
			await vscode.workspace.fs.writeFile(dataFile, new Uint8Array());
		}
		return this.thoughts;
	}

	// Writes the data into the Thoughts file
	async writeThoughts(): Promise<void> {
		let data = {
			dates: this.thoughts,
		} as ThoughtsFile;
		await vscode.workspace.fs.writeFile(
			await this.getThoughtsFile(),
			new TextEncoder().encode(JSON.stringify(data, undefined, '\t')));

		this.tree.updateThoughts(this.thoughts);
	}
}
