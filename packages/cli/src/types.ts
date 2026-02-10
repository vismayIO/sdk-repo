export type FlagValue = string | boolean;

export interface ParsedArgs {
  positional: string[];
  flags: Record<string, FlagValue>;
}

export interface CreateGeneratorData {
  projectName: string;
  title: string;
  targetDirAbs: string;
  moduleName: string;
  federationName: string;
  port: number;
  manifestUrl: string;
}

export interface CreateCliConfig {
  yes: boolean;
  projectName: string;
  targetDirAbs: string;
  moduleName: string;
  federationName: string;
  port: number;
  manifestUrl: string;
  title: string;
}

export interface PlopChange {
  type?: string;
  path?: string;
  message?: string;
}

export interface PlopFailure {
  error?: unknown;
  message?: string;
}

export interface PlopRunResult {
  changes: PlopChange[];
  failures: PlopFailure[];
}

export interface PlopGenerator {
  runActions(data?: unknown): Promise<PlopRunResult>;
}

export interface PlopInstance {
  getGenerator(name: string): PlopGenerator;
}
