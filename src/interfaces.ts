export interface Thought {
	id: string,
	timestamp: Date;
	message: string;
}

export interface ThoughtsFile {
	dates: DatedThoughts[];
}

export interface DatedThoughts {
	day: string;
	thoughts: Thought[];
}
