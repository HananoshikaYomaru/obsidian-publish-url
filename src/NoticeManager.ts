import { Notice, Plugin } from "obsidian";

export class NoticeManager {
	plugin: Plugin;
	constructor(plugin: Plugin) {
		this.plugin = plugin;
	}

	createNotice = (
		message: string | DocumentFragment,
		duration?: number | undefined
	): Notice => {
		const notice = new Notice(
			`${this.plugin.manifest.name}: ${message}`,
			duration
		);
		return notice;
	};
}
