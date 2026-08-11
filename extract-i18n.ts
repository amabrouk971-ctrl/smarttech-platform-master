import { Project, SyntaxKind, StringLiteral, JsxText, Node } from "ts-morph";
import * as fs from 'fs';

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const arabicRegex = /[\u0600-\u06FF]/;
let translations: Record<string, { ar: string, en: string }> = {};
let keyCounter = 1;

function generateKey(text: string) {
  let englishApprox = "text_" + keyCounter;
  keyCounter++;
  return englishApprox;
}

const sourceFiles = project.getSourceFiles("src/**/*.tsx").concat(project.getSourceFiles("src/**/*.ts"));

for (const sourceFile of sourceFiles) {
  if (sourceFile.getFilePath().includes('LanguageContext') || sourceFile.getFilePath().includes('seedData')) {
    continue;
  }
  
  let modified = false;

  // Find all string literals
  const stringLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.StringLiteral);
  for (const literal of stringLiterals) {
    const text = literal.getLiteralText();
    if (arabicRegex.test(text)) {
      // It's an Arabic string in a string literal
      const key = generateKey(text);
      translations[key] = { ar: text, en: text + " [EN]" };
      
      // We must avoid replacing strings in import statements
      if (!literal.getFirstAncestorByKind(SyntaxKind.ImportDeclaration)) {
          // If it's a JSX attribute, it might need different handling, but ts-morph can handle it if we replace with JSX expression
          const parent = literal.getParent();
          if (parent && parent.getKind() === SyntaxKind.JsxAttribute) {
             literal.replaceWithText(`{t('${key}')}`);
          } else {
             literal.replaceWithText(`t('${key}')`);
          }
          modified = true;
      }
    }
  }

  // Find all JSX Text
  const jsxTexts = sourceFile.getDescendantsOfKind(SyntaxKind.JsxText);
  for (const jsxText of jsxTexts) {
    const text = jsxText.getText();
    if (arabicRegex.test(text) && text.trim().length > 0) {
      const trimmed = text.trim();
      const key = generateKey(trimmed);
      translations[key] = { ar: trimmed, en: trimmed + " [EN]" };
      
      jsxText.replaceWithText(`{t('${key}')}`);
      modified = true;
    }
  }

  if (modified) {
    // Add import { useLanguage } from '...LanguageContext' if not exists
    const imports = sourceFile.getImportDeclarations();
    const hasUseLanguage = imports.some(i => i.getNamedImports().some(ni => ni.getName() === 'useLanguage'));
    
    if (!hasUseLanguage) {
      // Find where LanguageContext is relative to this file
      // A simple hack: just add it and let the developer fix the path or try to compute it.
      // But we need 't' available. This is too complex to just inject `const { t } = useLanguage();` safely everywhere.
    }
    
    // sourceFile.saveSync(); // We won't save yet until we verify.
  }
}

console.log("Found Arabic strings:", Object.keys(translations).length);
fs.writeFileSync('extracted-translations.json', JSON.stringify(translations, null, 2));

