export interface Thought {
	id: string,
	timestamp: Date;
	message: string;
}

export interface ThoughtsFile {
	dates: Day[];
}

export interface Day {
	timestamp: Date;
	thoughts: Thought[];
}
