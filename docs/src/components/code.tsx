import { CodeBlock } from "@vercel/geistdocs/components/code-block";
import { codeToTokens, type BundledLanguage, type SpecialLanguage } from "shiki";
import { docsShikiTheme } from "@/lib/shiki-theme";

/** Highlight homepage examples using the same theme and code UI as the docs. */
export async function Code({ children, lang = "typescript", filename }: {
  children: string;
  lang?: BundledLanguage | SpecialLanguage;
  filename?: string;
}) {
  const { tokens } = await codeToTokens(children.trim(), { lang, theme: docsShikiTheme });
  return (
    <CodeBlock title={filename}>
      <code>
        {tokens.map((line, index) => (
          <span className="line" key={index}>
            {line.map((token, i) => <span key={i} style={{ color: token.color }}>{token.content}</span>)}
            {index < tokens.length - 1 ? "\n" : ""}
          </span>
        ))}
      </code>
    </CodeBlock>
  );
}
