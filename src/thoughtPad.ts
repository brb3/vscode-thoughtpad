import { readFileSync, writeFileSync } from "fs";
import * as vscode from "vscode";
import path = require("path");
import { ThoughtsDataProvider } from "./thoughtsDataProvider";
import { DatedThoughts, Thought, ThoughtsFile } from "./interfaces";
import { v4 as uuidv4 } from "uuid";

export class ThoughtPad {
	constructor(treeView: ThoughtsDataProvider) {
		this.tree = treeView;
		this.thoughts = this.loadThoughts();
	}
	tree: ThoughtsDataProvider;
	thoughts: DatedThoughts[];

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

	// Finds the path of the Thoughts file.
	// Notifies the user of an error if no Thoughts file is found.
	getThoughtsFile(): string {
		const config = vscode.workspace.getConfiguration("thoughtpad");
		const tFC = config.get("thoughtsFile") as string | undefined;

		if (!tFC || tFC === "") {
			vscode.window.showErrorMessage("No Thoughts File configured in your Settings!");
			return "";
		}

		return path.resolve(tFC!);
	}

	// Loads the Thoughts into our data property.
	loadThoughts(): DatedThoughts[] {
		const data = readFileSync(this.getThoughtsFile());
		const jsonData = JSON.parse(data.toString()) as ThoughtsFile;
		return jsonData.dates;
	}

	// Writes the data into the Thoughts file
	writeThoughts(): void {
		let data = {
			dates: this.thoughts,
		} as ThoughtsFile;
		writeFileSync(this.getThoughtsFile(), JSON.stringify(data, undefined, "\t"));

		this.tree.updateThoughts(this.thoughts);
	}
}
