import { Plugin, CachedMetadata, TFile, MetadataCache } from "obsidian";

interface MetadataCacheWithTags extends MetadataCache {
	getTags(): Record<string, number>;
	_origGetTags?: () => Record<string, number>;
	_origGetFileCache?: (file: TFile) => CachedMetadata | null;
}

function suppressTagClick(evt: MouseEvent) {
	const target = evt.target as HTMLElement;
	if (target?.closest) {
		const anchor = target.closest("a.tag");
		if (anchor) {
			if (!anchor.closest(".metadata-container") && !anchor.closest(".metadata-property")) {
				evt.preventDefault();
				evt.stopPropagation();
			}
		}
	}
}

export default class TagescapePlugin extends Plugin {
	onload = () => {
		this.registerReadingViewHandler();
		this.registerPostProcessor();
		this.patchMetadataCache();
	};

	onunload = () => {
		this.unpatchMetadataCache();
		document.removeEventListener("click", suppressTagClick, true);
	};

	private patchMetadataCache = () => {
		const extCache = this.app.metadataCache as MetadataCacheWithTags;
		const origGetFileCache = extCache.getFileCache;

		// Store original for restoration
		extCache._origGetFileCache = origGetFileCache;

		// Patch getFileCache to strip inline tags
		extCache.getFileCache = (file: TFile): CachedMetadata | null => {
			const result = origGetFileCache.call(extCache, file);
			if (!result) return result;

			if (result.tags) {
				const patched: CachedMetadata = { ...result };
				delete patched.tags;
				return patched;
			}

			return result;
		};

		// Patch getTags to only count frontmatter tags
		if (typeof extCache.getTags === "function") {
			const origGetTags = extCache.getTags;
			const vault = this.app.vault;
			extCache._origGetTags = origGetTags;

			extCache.getTags = (): Record<string, number> => {
				const frontmatterOnly: Record<string, number> = {};
				const files = vault.getMarkdownFiles();
				for (const file of files) {
					const meta = origGetFileCache.call(extCache, file);
					if (!meta?.frontmatter) continue;

					const fmTags: string[] = [];
					for (const key of ["tags", "tag"] as const) {
						const raw: unknown = meta.frontmatter[key];
						if (!raw) continue;
						if (Array.isArray(raw)) {
							for (const item of raw) {
								if (typeof item === "string") fmTags.push(item);
							}
						} else if (typeof raw === "string") {
							fmTags.push(...raw.split(",").map((t) => t.trim()));
						}
					}

					for (const t of fmTags) {
						if (!t) continue;
						const normalized = t.startsWith("#") ? t : `#${t}`;
						frontmatterOnly[normalized] = (frontmatterOnly[normalized] || 0) + 1;
					}
				}
				return frontmatterOnly;
			};
		}
	}

	private unpatchMetadataCache = () => {
		const extCache = this.app.metadataCache as MetadataCacheWithTags;
		if (extCache._origGetFileCache) {
			extCache.getFileCache = extCache._origGetFileCache;
			delete extCache._origGetFileCache;
		}
		if (extCache._origGetTags) {
			extCache.getTags = extCache._origGetTags;
			delete extCache._origGetTags;
		}
	}

	private registerPostProcessor = () => {
		this.registerMarkdownPostProcessor((el: HTMLElement) => {
			const tagLinks = el.querySelectorAll("a.tag");
			tagLinks.forEach((link) => {
				if (link.closest(".metadata-container") || link.closest(".metadata-property")) {
					return;
				}
				const span = createSpan();
				span.textContent = link.textContent;
				link.replaceWith(span);
			});
		});
	}

	private registerReadingViewHandler = () => {
		document.addEventListener("click", suppressTagClick, true);
	}
}
