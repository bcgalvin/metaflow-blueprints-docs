import { SampleFile, TextFile } from "projen";
import {
  NodePackageManager,
  TrailingComma,
  TypeScriptModuleResolution,
} from "projen/lib/javascript";
import { TypeScriptProject } from "projen/lib/typescript";
const nodeVersion = "20";
const commonIgnore = [
  ".vscode/settings.json",
  ".vitepress/dist",
  ".vitepress/cache",
  ".vitepress/.temp",
];
const developmentDeps = ["eslint-plugin-unicorn", "tsx"];
const deps = ["vitepress", "vue"];

const project = new TypeScriptProject({
  name: "metaflow-blueprints-docs",
  description: "Documentation for Metaflow Blueprints",
  defaultReleaseBranch: "main",
  packageManager: NodePackageManager.PNPM,
  deps: deps,
  devDeps: developmentDeps,
  release: false,
  github: false,
  projenrcTs: true,
  prettier: true,
  maxNodeVersion: nodeVersion,
  minNodeVersion: nodeVersion,
  prettierOptions: {
    settings: {
      trailingComma: TrailingComma.ALL,
    },
  },
  jest: false,
  tsconfig: {
    compilerOptions: {
      module: "ES2020",
      moduleResolution: TypeScriptModuleResolution.NODE,
      lib: ["DOM", "ES2020"],
      noUncheckedIndexedAccess: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
      target: "ES2020",
    },
  },
  gitignore: commonIgnore,
});

project.deps.removeDependency("ts-node");
project.defaultTask?.reset();
project.defaultTask?.exec("tsx .projenrc.ts");
project.eslint?.addPlugins("unicorn");
project.eslint?.addExtends("plugin:unicorn/recommended");
project.setScript("preinstall", "npx only-allow pnpm");

new SampleFile(project, ".vitepress/config.ts", {
  contents: [
    'import { defineConfig } from "vitepress";',
    "",
    "export default defineConfig({",
    "  //",
    "});",
    "",
  ].join("\n"),
});

new TextFile(project, ".editorconfig", {
  lines: [
    "root = true",
    "",
    "[*]",
    "indent_style = space",
    "indent_size = 2",
    "end_of_line = lf",
    "charset = utf-8",
    "trim_trailing_whitespace = true",
    "insert_final_newline = true",
    "",
    "[*.md]",
    "trim_trailing_whitespace = false",
    "max_line_length = 120",
    "",
  ],
});

new TextFile(project, ".markdownlint.json", {
  lines: ["{", '  "MD013": {', '    "line_length": 120', "  }", "}"],
});

new TextFile(project, ".nvmrc", {
  lines: [nodeVersion],
});

project.addTask("docs:dev", { exec: "DEBUG=vitepress* vitepress dev" });
project.addTask("docs:build", {
  exec: "DEBUG=vitepress* vitepress build",
});
project.addTask("docs:serve", { exec: "DEBUG=vitepress* vitepress serve" });
new SampleFile(project, "docs/.vitepress/config.ts", {
  contents: [
    'import { defineConfig } from "vitepress";',
    "",
    "export default defineConfig({",
    "  //",
    "});",
    "",
  ].join("\n"),
});

project.compileTask.reset();
project.compileTask.exec("vitepress build");
project.packageTask.reset();

project.package.file.addOverride("type", "module");

project.synth();
