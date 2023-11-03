import {
	App,
	EventRef,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
} from "obsidian";
import "@total-typescript/ts-reset";
import "@total-typescript/ts-reset/dom";
import { DEFAULT_SETTING, MySettingManager } from "@/SettingManager";

import { NoticeManager } from "@/NoticeManager";

const getPublishUrl = (
	path: string,
	publishDomain: string,
	permalink?: string
) => {
	if (permalink) return `https://${publishDomain}/${permalink}`;
	// Remove the .md extension from the path
	const pathWithoutExtension = path.replace(/\.md$/, "");

	// Encode the path using encodeURIComponent to escape special characters,
	// then replace encoded spaces with a plus sign
	const encodedPath = encodeURIComponent(pathWithoutExtension).replace(
		/%20/g,
		"+"
	);

	return `https://${publishDomain}/${encodedPath}`;
};

export function isMarkdownFile(file: TFile) {
	return file && file.extension === "md";
}

export default class PublishUrlSetting extends Plugin {
	settingManager: MySettingManager;
	noticeManager: NoticeManager;
	private eventRefs: EventRef[] = [];

	async onload() {
		const that = this;
		// initialize the setting manager
		this.settingManager = new MySettingManager(this);
		this.noticeManager = new NoticeManager(this);

		// load the setting using setting manager
		await this.settingManager.loadSettings();

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "copy-publish-url",
			name: "Copy publish url",
			editorCheckCallback(checking, editor, ctx) {
				if (!ctx.file) return;
				if (checking) {
					return isMarkdownFile(ctx.file);
				}
				const publishUrl = that.copyPublishUrl(ctx.file);
				// copy this to clipboard
				navigator.clipboard.writeText(publishUrl);
				that.createNotice("Copied publish url to clipboard");
			},
		});

		this.addCommand({
			id: "copy-theog-url",
			name: "Copy theog url",
			editorCheckCallback(checking, editor, ctx) {
				if (!ctx.file) return;
				if (checking) {
					return isMarkdownFile(ctx.file);
				}
				// get the publish url
				const publishUrl = that.copyPublishUrl(ctx.file);
				const theogUrl = that.copyTheogUrl(
					publishUrl,
					that.settingManager.getSettings().theogTemplate
				);
				// copy this to clipboard
				navigator.clipboard.writeText(theogUrl);
				that.createNotice("Copied theog url to clipboard");
			},
		});

		this.addCommand({
			id: "open-in-publish",
			name: "Open in publish",
			editorCheckCallback(checking, editor, ctx) {
				if (!ctx.file) return;
				if (checking) {
					return isMarkdownFile(ctx.file);
				}
				// get the publish url
				const publishUrl = that.copyPublishUrl(ctx.file);
				// open in default browser
				window.open(publishUrl, "_blank");
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));
	}

	copyPublishUrl = (file: TFile) => {
		const path = file.path;
		// get the frontmatter of the current file
		const frontmatter =
			this.app.metadataCache.getFileCache(file)?.frontmatter;
		const publishDomain = this.settingManager.getSettings().publishDomain;
		const permalink = frontmatter?.permalink;
		const publishUrl = getPublishUrl(path, publishDomain, permalink);
		return publishUrl;
	};

	copyTheogUrl = (url: string, template: number) => {
		// Construct the new URL with query parameters
		const theogBaseUrl = "https://theog.io/goto";

		return `${theogBaseUrl}?url=${url}&template=${template}`;
	};

	createNotice = (
		message: string | DocumentFragment,
		duration?: number | undefined
	): Notice => this.noticeManager.createNotice(message, duration);

	onunload() {
		super.onunload();
		// unload all event ref
		for (const eventRef of this.eventRefs) {
			this.app.workspace.offref(eventRef);
		}
	}
}

class SettingTab extends PluginSettingTab {
	plugin: PublishUrlSetting;

	constructor(app: App, plugin: PublishUrlSetting) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl).setName("Publish domain").addText((text) =>
			text
				.setPlaceholder("Your publish domain")
				.setValue(
					this.plugin.settingManager.getSettings().publishDomain
				)
				.onChange(async (value) => {
					this.plugin.settingManager.updateSettings((setting) => {
						setting.value.publishDomain = value;
					});
				})
		);

		new Setting(containerEl).setName("Template Number").addText((text) => {
			text.setPlaceholder(String(DEFAULT_SETTING.theogTemplate))
				.setValue(
					String(
						this.plugin.settingManager.getSettings().theogTemplate
					)
				)
				.onChange(async (value) => {
					this.plugin.settingManager.updateSettings((setting) => {
						setting.value.theogTemplate = Number(value);
					});
				});
		});
	}
}
