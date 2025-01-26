import path from "path";
import fs from "fs";
import type { Plugin } from "vite";
export function localesPlugin(): Plugin {
  return {
    name: "locales-merge",
    enforce: "post",
    generateBundle(_options, bundle) {
      const localesDir = path.resolve(__dirname, "../locales"); // 注意修改你的 locales 目录
      const namespaces = fs.readdirSync(localesDir);
      const languageResources: { [key: string]: any } = {};

      namespaces.forEach((namespace) => {
        const namespacePath = path.join(localesDir, namespace);
        const files = fs
          .readdirSync(namespacePath)
          .filter((file) => file.endsWith(".json"));

        files.forEach((file) => {
          const lang = path.basename(file, ".json");
          const filePath = path.join(namespacePath, file);
          const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));

          if (!languageResources[lang]) {
            languageResources[lang] = {};
          }
          languageResources[lang][namespace] = content;
        });
      });

      Object.entries(languageResources).forEach(([lang, resources]) => {
        const fileName = `locales/${lang}.js`;
        const content = `export default ${JSON.stringify(resources)};`;

        this.emitFile({
          type: "asset",
          fileName,
          source: content,
        });
      });

      Object.keys(bundle).forEach((key) => {
        if (key.startsWith("locales/") && key.endsWith(".json")) {
          delete bundle[key];
        }
      });
    },
  };
}
