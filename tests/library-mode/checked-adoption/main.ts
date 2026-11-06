export function parse(text: string): number { const value: unknown = JSON.parse(text); return (value as {x: number}).x; }
export function sealed(text: string): number { const value: unknown = JSON.parse(text); return Object.isSealed(value) ? 1 : 0; }
export function extensible(text: string): number { const value: unknown = JSON.parse(text); return Object.isExtensible(value) ? 1 : 0; }
