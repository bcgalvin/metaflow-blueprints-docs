import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitepress";

export default defineConfig({
  srcDir: "src",
  title: "Metaflow Blueprints",
  description: "Documentation for Metaflow Blueprints",
  lastUpdated: true,

  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },

  head: [
    [
      "link",
      {
        rel: "icon",
        href: "/public/logo.svg",
      },
    ],
  ],

  themeConfig: {
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/bcgalvin/metaflow-blueprints",
      },
    ],
    editLink: {
      pattern:
        "https://github.com/bcgalvin/metaflow-blueprints-docs/edit/main/src/:path",
      text: "Edit this page on GitHub",
    },
    logo: { src: "/assets/logo.svg" },
    nav: [{ text: "Guide", link: "/", activeMatch: "^/$|^/guide/" }],
  },
});
