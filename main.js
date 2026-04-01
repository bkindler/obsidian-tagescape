var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => TagescapePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
function suppressTagClick(evt) {
  const target = evt.target;
  if (target == null ? void 0 : target.closest) {
    const anchor = target.closest("a.tag");
    if (anchor) {
      if (!anchor.closest(".metadata-container") && !anchor.closest(".metadata-property")) {
        evt.preventDefault();
        evt.stopPropagation();
      }
    }
  }
}
var TagescapePlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.onload = () => {
      this.registerReadingViewHandler();
      this.registerPostProcessor();
      this.patchMetadataCache();
    };
    this.onunload = () => {
      this.unpatchMetadataCache();
      document.removeEventListener("click", suppressTagClick, true);
    };
    this.patchMetadataCache = () => {
      const extCache = this.app.metadataCache;
      const origGetFileCache = extCache.getFileCache;
      extCache._origGetFileCache = origGetFileCache;
      extCache.getFileCache = (file) => {
        const result = origGetFileCache.call(extCache, file);
        if (!result)
          return result;
        if (result.tags) {
          const patched = { ...result };
          delete patched.tags;
          return patched;
        }
        return result;
      };
      if (typeof extCache.getTags === "function") {
        const origGetTags = extCache.getTags;
        const vault = this.app.vault;
        extCache._origGetTags = origGetTags;
        extCache.getTags = () => {
          const frontmatterOnly = {};
          const files = vault.getMarkdownFiles();
          for (const file of files) {
            const meta = origGetFileCache.call(extCache, file);
            if (!(meta == null ? void 0 : meta.frontmatter))
              continue;
            const fmTags = [];
            for (const key of ["tags", "tag"]) {
              const raw = meta.frontmatter[key];
              if (!raw)
                continue;
              if (Array.isArray(raw)) {
                for (const item of raw) {
                  if (typeof item === "string")
                    fmTags.push(item);
                }
              } else if (typeof raw === "string") {
                fmTags.push(...raw.split(",").map((t) => t.trim()));
              }
            }
            for (const t of fmTags) {
              if (!t)
                continue;
              const normalized = t.startsWith("#") ? t : `#${t}`;
              frontmatterOnly[normalized] = (frontmatterOnly[normalized] || 0) + 1;
            }
          }
          return frontmatterOnly;
        };
      }
    };
    this.unpatchMetadataCache = () => {
      const extCache = this.app.metadataCache;
      if (extCache._origGetFileCache) {
        extCache.getFileCache = extCache._origGetFileCache;
        delete extCache._origGetFileCache;
      }
      if (extCache._origGetTags) {
        extCache.getTags = extCache._origGetTags;
        delete extCache._origGetTags;
      }
    };
    this.registerPostProcessor = () => {
      this.registerMarkdownPostProcessor((el) => {
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
    };
    this.registerReadingViewHandler = () => {
      document.addEventListener("click", suppressTagClick, true);
    };
  }
};
