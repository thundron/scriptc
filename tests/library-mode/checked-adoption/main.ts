export function parse(text: string): number { const value: unknown = JSON.parse(text); return (value as {x: number}).x; }
