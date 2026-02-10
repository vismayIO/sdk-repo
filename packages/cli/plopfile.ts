import path from "node:path";
import { fileURLToPath } from "node:url";

interface ActionConfig {
  type: string;
  path?: string;
  templateFile?: string;
  force?: boolean;
}

interface GeneratorConfig {
  description: string;
  prompts: unknown[];
  actions: ActionConfig[];
}

interface PlopApi {
  setGenerator(name: string, config: GeneratorConfig): void;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, "templates", "web-app");

export default function registerGenerators(plop: PlopApi): void {
  plop.setGenerator("remote-app", {
    description: "Scaffold a new Module Federation remote app",
    prompts: [],
    actions: [
      {
        type: "add",
        path: "{{targetDirAbs}}/package.json",
        templateFile: path.join(templatesDir, "package.json.hbs"),
      },
      {
        type: "add",
        path: "{{targetDirAbs}}/tsconfig.json",
        templateFile: path.join(templatesDir, "tsconfig.json.hbs"),
      },
      {
        type: "add",
        path: "{{targetDirAbs}}/webpack.config.js",
        templateFile: path.join(templatesDir, "webpack.config.js.hbs"),
      },
      {
        type: "add",
        path: "{{targetDirAbs}}/index.html",
        templateFile: path.join(templatesDir, "index.html.hbs"),
      },
      {
        type: "add",
        path: "{{targetDirAbs}}/README.md",
        templateFile: path.join(templatesDir, "README.md.hbs"),
      },
      {
        type: "add",
        path: "{{targetDirAbs}}/src/index.ts",
        templateFile: path.join(templatesDir, "src", "index.ts.hbs"),
      },
      {
        type: "add",
        path: "{{targetDirAbs}}/src/bootstrap.tsx",
        templateFile: path.join(templatesDir, "src", "bootstrap.tsx.hbs"),
      },
      {
        type: "add",
        path: "{{targetDirAbs}}/src/App.tsx",
        templateFile: path.join(templatesDir, "src", "App.tsx.hbs"),
      },
      {
        type: "add",
        path: "{{targetDirAbs}}/src/pages/{{moduleName}}.tsx",
        templateFile: path.join(
          templatesDir,
          "src",
          "pages",
          "module-page.tsx.hbs",
        ),
      },
      {
        type: "add",
        path: "{{targetDirAbs}}/src/pages/{{moduleName}}Expose.tsx",
        templateFile: path.join(
          templatesDir,
          "src",
          "pages",
          "module-expose.tsx.hbs",
        ),
      },
      {
        type: "add",
        path: "{{targetDirAbs}}/src/index.css",
        templateFile: path.join(templatesDir, "src", "index.css.hbs"),
      },
    ],
  });
}
