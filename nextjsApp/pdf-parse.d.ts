// In file: pdf-parse.d.ts
declare module 'pdf-parse/lib/pdf-parse.js' {
  function pdf(dataBuffer: Buffer, options?: unknown): Promise<unknown>;
  export default pdf;
}