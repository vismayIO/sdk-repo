// Type declarations for WebAssembly modules
declare module "*.wasm" {
    const content: string;
    export default content;
}

// Specific declarations for DuckDB WASM files
declare module "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm" {
    const content: string;
    export default content;
}

declare module "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm" {
    const content: string;
    export default content;
}

declare module "@duckdb/duckdb-wasm/dist/duckdb-coi.wasm" {
    const content: string;
    export default content;
}
