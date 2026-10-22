import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  { ignores: [".next/**", "node_modules/**", ".data/**", "next-env.d.ts", "reports/**"] },
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Logo preview uses a local blob: URL that next/image cannot optimise.
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
