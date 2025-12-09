import path from "path";
import { defineConfig, loadEnv } from "vite";
import dts from "vite-plugin-dts"; // 引入 dts 插件
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [
      react(),
      dts({
        include: ["lib/**/*.ts", "lib/**/*.tsx"], // 指定扫描路径
        outDir: "dist", // 输出到 dist
        insertTypesEntry: true, // 自动生成 types 入口
        // rollupTypes: true // 可选：如果你想把所有类型合并成一个 .d.ts 文件，开启这个
      }),
    ],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, "lib/index.ts"),
        name: "full-scroller",
        formats: ["es", "cjs"], // 输出 ESM 和 CJS 两种格式
        fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
      },
      rollupOptions: {
        // 确保 React 不会被打包进去
        external: ["react", "react-dom", "react/jsx-runtime"],
        output: {
          // 改动点 2：保持文件目录结构（解决“所有组件在一个文件”的问题）
          // 开启这个选项后，你的 dist 目录结构会跟 src 保持一致
          preserveModules: true,
          preserveModulesRoot: "src", // 也就是去掉 src 这一层目录，直接把内容放到 dist 下

          // 改动点 3：优化文件名
          // 因为开启了 preserveModules，文件名不能死板，要用占位符
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name.includes("node_modules")) {
              return "vendor/[name].js"; // 处理可能混入的第三方依赖
            }
            return "[name].js";
          },
          // 为 CJS 和 ESM 提供全局变量支持
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
          },
        },
      },
      minify: false,
    },
  };
});
