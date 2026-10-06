const fs = require('fs');
let content = fs.readFileSync('src/context/InventoryContext.tsx', 'utf8');

// Insert import
if (!content.includes("import { translations }")) {
  content = content.replace(/import React/, "import { translations } from '../utils/translations';\nimport React");
}

// Ensure `t` is defined in the top of InventoryProvider because it seems `t` is still missing in many places.
content = content.replace(
  /export const InventoryProvider: React\.FC<\{ children: React\.ReactNode \}> = \(\{ children \}\) => \{/,
  "export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {\n  const [settings, setSettings] = useState<AppSettings>(initialSettings);\n  const t = translations[settings.language] || translations.hi;\n"
);

// We need to be careful not to duplicate state.
