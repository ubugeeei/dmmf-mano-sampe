export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: "frontend",
  serverDir: "backend",
  imports: { autoImport: false },
  components: { dirs: [] },
  app: {
    head: {
      title: "DMMF Todo App - Functional Domain Modeling",
      meta: [
        {
          name: "description",
          content: "Todo app demonstrating Domain Modeling Made Functional concepts",
        },
      ],
      link: [{ rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/water.css@2/out/water.css" }],
    },
  },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2024-11-01",
  typescript: {
    strict: true,
  },
});
