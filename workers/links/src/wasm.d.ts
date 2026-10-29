// Wrangler bundles a .wasm import as a compiled WebAssembly.Module (the CompiledWasm rule).
declare module '*.wasm' {
  const module: WebAssembly.Module;
  export default module;
}
