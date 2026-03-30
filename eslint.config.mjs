import obsidianPlugin from "eslint-plugin-obsidianmd";
import tseslint from "typescript-eslint";

export default tseslint.config(
	...tseslint.configs.recommended,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		files: ["**/*.ts"],
		plugins: {
			obsidianmd: obsidianPlugin,
		},
		rules: obsidianPlugin.configs.recommended,
	},
	{
		ignores: ["*.mjs", "*.js"],
	},
);
