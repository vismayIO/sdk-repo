import { existsSync } from "node:fs";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import type {
  CreateCliConfig,
  CreateGeneratorData,
  FlagValue,
  ParsedArgs,
  PlopInstance,
  PlopRunResult,
} from "./types";

const COMMANDS = new Set(["create", "help"] as const);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLOPFILE_PATH = path.resolve(__dirname, "../plopfile.ts");

type SupportedCommand = "create" | "help";

function printHelp() {
  console.log(`
create-sdk-remote (Bun + Plop + TypeScript)

Usage:
  bunx create-sdk-remote [project-name] [options]
  bunx create-sdk-remote create [project-name] [options]
  bunx create-sdk-remote help

Commands:
  create   Scaffold a new remote application
  help     Show this message

Options:
  --yes                    Skip prompts and use defaults
  --dir <path>             Target directory (default: apps/<project>)
  --module <name>          Exposed module component (default: <Project>Dashboard)
  --federation-name <name> Remote federation name (default: <project>_mfe)
  --port <number>          Remote dev server port (default: 5173)
  --manifest-url <url>     Remote manifest URL (default: http://localhost:<port>/mf-manifest.json)

Examples:
  bunx create-sdk-remote billing --yes
  bunx create-sdk-remote create billing --port 5174
`);
}

function parseArgs(args: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    positional: [],
    flags: {},
  };

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];

    if (!token.startsWith("--")) {
      parsed.positional.push(token);
      continue;
    }

    const withoutPrefix = token.slice(2);
    const [key, inlineValue] = withoutPrefix.split("=", 2);

    if (!key) {
      continue;
    }

    if (inlineValue !== undefined) {
      parsed.flags[key] = inlineValue;
      continue;
    }

    const next = args[index + 1];
    if (next && !next.startsWith("--")) {
      parsed.flags[key] = next;
      index += 1;
      continue;
    }

    parsed.flags[key] = true;
  }

  return parsed;
}

function readFlag(flags: Record<string, FlagValue>, key: string): string {
  const value = flags[key];
  return typeof value === "string" ? value.trim() : "";
}

function isTruthy(value: FlagValue | undefined): boolean {
  return value === true || value === "true" || value === "1" || value === "yes";
}

function splitWords(value: string): string[] {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

function toKebabCase(value: string): string {
  return splitWords(value).join("-");
}

function toSnakeCase(value: string): string {
  return splitWords(value).join("_");
}

function toPascalCase(value: string): string {
  return splitWords(value)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function toTitleCase(value: string): string {
  return splitWords(value)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function sanitizeIdentifier(value: string, fallback: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9_]/g, "");
  return cleaned || fallback;
}

function sanitizeProjectName(value: string): string {
  const cleaned = toKebabCase(value);
  return cleaned || "remote-app";
}

function sanitizeFederationName(value: string, fallback: string): string {
  const cleaned = value.trim().replace(/[^a-zA-Z0-9_]/g, "_");
  return cleaned || fallback;
}

function resolveFromCwd(targetPath: string): string {
  if (path.isAbsolute(targetPath)) {
    return targetPath;
  }

  return path.resolve(process.cwd(), targetPath);
}

function normalizeManifestUrl(value: string): string {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error(`Invalid manifest URL: ${value}`);
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("Manifest URL must start with http:// or https://");
  }

  return parsedUrl.toString();
}

async function askText(rl: readline.Interface, label: string, fallback: string): Promise<string> {
  const answer = await rl.question(`${label} (${fallback}): `);
  const trimmed = answer.trim();
  return trimmed || fallback;
}

async function ensureTargetDir(targetDirAbs: string): Promise<void> {
  if (!existsSync(targetDirAbs)) {
    await mkdir(targetDirAbs, { recursive: true });
    return;
  }

  const entries = await readdir(targetDirAbs);
  if (entries.length > 0) {
    throw new Error(`Target directory is not empty: ${targetDirAbs}`);
  }
}

async function createPlopInstance(): Promise<PlopInstance> {
  const moduleRef = await import("node-plop");
  const nodePlop = (moduleRef.default ?? moduleRef) as unknown as (
    plopfilePath: string
  ) => Promise<PlopInstance> | PlopInstance;

  return await nodePlop(PLOPFILE_PATH);
}

function stringifyFailure(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return String(error);
}

function assertRunSuccess(result: PlopRunResult, context: string): void {
  if (result.failures.length === 0) {
    return;
  }

  const details = result.failures
    .map((failure, index) => {
      if (failure.error !== undefined) {
        return `${index + 1}. ${stringifyFailure(failure.error)}`;
      }
      if (failure.message) {
        return `${index + 1}. ${failure.message}`;
      }
      return `${index + 1}. Unknown plop failure`;
    })
    .join("\n");

  throw new Error(`${context} failed:\n${details}`);
}

async function runPlopGenerator(data: object, context: string): Promise<PlopRunResult> {
  const plop = await createPlopInstance();
  const generator = plop.getGenerator("remote-app");
  const result = await generator.runActions(data);
  assertRunSuccess(result, context);
  return result;
}

async function buildCreateConfig(parsed: ParsedArgs): Promise<CreateCliConfig> {
  const yes = isTruthy(parsed.flags.yes);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    let rawProjectName = parsed.positional[0] || "";
    if (!rawProjectName && !yes) {
      rawProjectName = await askText(rl, "Project name", "remote-app");
    }

    if (!rawProjectName) {
      throw new Error("Project name is required. Example: bunx create-sdk-remote billing");
    }

    const projectName = sanitizeProjectName(rawProjectName);

    const defaultDir = readFlag(parsed.flags, "dir") || `apps/${projectName}`;
    const targetDir = yes ? defaultDir : await askText(rl, "Target directory", defaultDir);
    const targetDirAbs = resolveFromCwd(targetDir);

    const defaultModule = `${toPascalCase(projectName)}Dashboard`;
    const moduleName = sanitizeIdentifier(
      readFlag(parsed.flags, "module") || (yes ? defaultModule : await askText(rl, "Exposed module", defaultModule)),
      defaultModule
    );

    const defaultFederation = `${toSnakeCase(projectName)}_mfe`;
    const federationName = sanitizeFederationName(
      readFlag(parsed.flags, "federation-name") ||
        (yes ? defaultFederation : await askText(rl, "Federation name", defaultFederation)),
      defaultFederation
    );

    const defaultPortRaw = readFlag(parsed.flags, "port") || "5173";
    const portRaw = yes ? defaultPortRaw : await askText(rl, "Dev server port", defaultPortRaw);
    const port = Number.parseInt(portRaw, 10);
    if (Number.isNaN(port) || port <= 0) {
      throw new Error(`Invalid port: ${portRaw}`);
    }

    const defaultManifestUrl = `http://localhost:${port}/mf-manifest.json`;
    const manifestUrl = normalizeManifestUrl(
      readFlag(parsed.flags, "manifest-url") ||
        (yes ? defaultManifestUrl : await askText(rl, "Manifest URL", defaultManifestUrl))
    );

    return {
      yes,
      projectName,
      targetDirAbs,
      moduleName,
      federationName,
      port,
      manifestUrl,
      title: toTitleCase(projectName),
    };
  } finally {
    rl.close();
  }
}

function getDisplayPath(absolutePath: string): string {
  const relative = path.relative(process.cwd(), absolutePath);
  if (!relative || relative.startsWith("..")) {
    return absolutePath;
  }

  return relative;
}

function countCreateChanges(result: PlopRunResult): number {
  return result.changes.filter((change) => change.type !== "skip").length;
}

async function handleCreate(parsed: ParsedArgs): Promise<void> {
  const config = await buildCreateConfig(parsed);
  await ensureTargetDir(config.targetDirAbs);

  const createData: CreateGeneratorData = {
    projectName: config.projectName,
    title: config.title,
    targetDirAbs: config.targetDirAbs,
    moduleName: config.moduleName,
    federationName: config.federationName,
    port: config.port,
    manifestUrl: config.manifestUrl,
  };

  const createResult = await runPlopGenerator(createData, "Remote scaffold");

  console.log(`\nScaffold created at ${config.targetDirAbs}`);
  console.log(`Generated files: ${countCreateChanges(createResult)}`);
  console.log(`Remote expose: ./${config.moduleName}`);
  console.log(`Manifest URL: ${config.manifestUrl}`);

  console.log(`\nNext steps:`);
  console.log(`1. cd ${getDisplayPath(config.targetDirAbs)}`);
  console.log(`2. bun install`);
  console.log(`3. bun run dev`);
}

async function run(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  let command: SupportedCommand = "create";
  if (args[0] && COMMANDS.has(args[0] as SupportedCommand)) {
    command = args.shift() as SupportedCommand;
  }

  const parsed = parseArgs(args);

  if (command === "help") {
    printHelp();
    return;
  }

  if (command === "create") {
    await handleCreate(parsed);
    return;
  }

  printHelp();
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\nError: ${message}`);
  process.exit(1);
});
