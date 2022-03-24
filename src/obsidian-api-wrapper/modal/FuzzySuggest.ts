import { App, FuzzySuggestModal } from 'obsidian'

export class fuzzysuggestmodal extends FuzzySuggestModal<string> {
    constructor(app: App, spec: any) {
        super(app);
		this.app = app;
		this.handler = spec.handler; // make sure to omit `()` in the function when creating the class.
		this.data = spec.data; // an object containing any additional data required for `runFunc`
    }

    getItems(): string[] {
		const files = this.app.vault.getMarkdownFiles();
		const fileList = files.map(file => file.path.replace(".md", ""));
        return fileList;
    }

    getItemText(item: string): string {
        return item;
    }

    onChooseItem(item: string, evt: MouseEvent | KeyboardEvent) {
		this.handler(item, evt, this.data); // pass selected data to a handler func;
    }
}
