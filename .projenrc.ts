import {
  NodePackageManager,
  TrailingComma,
  TypeScriptModuleResolution,
} from "projen/lib/javascript";
import { TypeScriptProject } from "projen/lib/typescript";

const commonIgnore = [".vscode/settings.json", "/.vitepress/dist"];

const devDeps = ["eslint-plugin-unicorn"];
const deps = ["vitepress", "vue"];

const project = new TypeScriptProject({
  name: "metaflow-blueprints-docs",
  description: "Documentation for Metaflow Blueprints",
  defaultReleaseBranch: "main",
  packageManager: NodePackageManager.PNPM,
  deps: deps,
  devDeps: devDeps,
  release: false,
  github: false,
  prettier: true,
  prettierOptions: {
    settings: {
      trailingComma: TrailingComma.ALL,
    },
  },
  jest: false,
  tsconfig: {
    compilerOptions: {
      module: "ES2022",
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

project.eslint?.addPlugins("unicorn");
project.setScript("preinstall", "npx only-allow pnpm");

project.synth();
