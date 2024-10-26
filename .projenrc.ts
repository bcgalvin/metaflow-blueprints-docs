import { TextFile } from "projen";
import { workflows } from "projen/lib/github";
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
  github: true,
  projenrcTs: true,
  prettier: true,
  maxNodeVersion: nodeVersion,
  depsUpgrade: false,
  minNodeVersion: nodeVersion,
  buildWorkflow: false,
  pullRequestTemplate: false,
  githubOptions: {
    pullRequestLint: false,
    mergify: false,
  },
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
project.compileTask.reset();
project.compileTask.exec("vitepress build");
project.packageTask.reset();
project.package.file.addOverride("type", "module");

project.addTask("docs:dev", { exec: "DEBUG=vitepress* vitepress dev" });
project.addTask("docs:build", {
  exec: "DEBUG=vitepress* vitepress build",
});
project.addTask("docs:serve", { exec: "DEBUG=vitepress* vitepress serve" });

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
  lines: ["{", '  "MD013": {', '    "line_length": 200', "  }", "}"],
});

new TextFile(project, ".nvmrc", {
  lines: [nodeVersion],
});
// Create the workflow with all configuration upfront
const deployWorkflow = project.github?.addWorkflow("deploy-pages");

deployWorkflow?.on({
  push: {
    branches: ["main"],
  },
  workflowDispatch: {},
});

deployWorkflow?.addJob("build", {
  name: "Build",
  runsOn: ["ubuntu-latest"],
  permissions: {
    actions: workflows.JobPermission.WRITE,
    pages: workflows.JobPermission.WRITE,
    idToken: workflows.JobPermission.WRITE,
  },
  steps: [
    {
      uses: "actions/checkout@v4",
    },
    {
      uses: "actions/setup-node@v4",
      with: {
        "node-version": nodeVersion,
      },
    },
    {
      uses: "pnpm/action-setup@v2",
      with: {
        version: "latest",
      },
    },
    {
      run: "pnpm install",
    },
    {
      run: "pnpm docs:build",
    },
    {
      uses: "actions/configure-pages@v4",
    },
    {
      uses: "actions/upload-pages-artifact@v3",
      with: {
        path: ".vitepress/dist",
      },
    },
  ],
  concurrency: {
    group: "pages",
    "cancel-in-progress": false,
  },
});

// Add deploy job
deployWorkflow?.addJob("deploy", {
  name: "Deploy",
  needs: ["build"],
  runsOn: ["ubuntu-latest"],
  permissions: {
    actions: workflows.JobPermission.WRITE,
    pages: workflows.JobPermission.WRITE,
    idToken: workflows.JobPermission.WRITE,
  },
  environment: {
    name: "github-pages",
    url: "${{ steps.deployment.outputs.page_url }}",
  },
  steps: [
    {
      uses: "actions/deploy-pages@v4",
      id: "deployment",
    },
  ],
  concurrency: {
    group: "pages",
    "cancel-in-progress": false,
  },
});

const build = project.github?.project.synth();
