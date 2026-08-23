import nextConfig from "eslint-config-next";
import reactHooksPlugin from "eslint-plugin-react-hooks";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["node_modules/**"],
  },
  {
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      // Suppress stricter experimental rules from eslint-config-next / React 19 lint
      // that produce false positives on legitimate patterns (e.g. window.location.href).
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      // Keep the well-established exhaustive-deps rule as a warning.
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
