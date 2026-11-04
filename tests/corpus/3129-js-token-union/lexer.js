// Inferred JavaScript variants have widened tags and optional padded fields.
export function lex(args) {
  const tokens = [];
  for (const arg of args) {
    if (!arg.startsWith("-") || /^-\d+$/.test(arg)) {
      tokens.push({ _tag: "Value", value: arg });
    } else if (arg.startsWith("--")) {
      const equalIndex = arg.indexOf("=");
      if (equalIndex !== -1) {
        tokens.push({ _tag: "LongOption", name: arg.slice(2, equalIndex), raw: arg, value: arg.slice(equalIndex + 1) });
      } else {
        tokens.push({ _tag: "LongOption", name: arg.slice(2), raw: arg });
      }
    } else {
      const flags = arg.slice(1);
      const equalIndex = flags.indexOf("=");
      if (equalIndex !== -1) {
        const flag = flags.slice(0, equalIndex);
        tokens.push({ _tag: "ShortOption", flag, raw: `-${flag}`, value: flags.slice(equalIndex + 1) });
      } else {
        for (const flag of flags) tokens.push({ _tag: "ShortOption", flag, raw: `-${flag}` });
      }
    }
  }
  return tokens;
}
