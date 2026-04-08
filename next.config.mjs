import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require('@next/env');

/** Same directory as this config file — avoids picking a parent `package-lock.json` as the workspace root. */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Load `.env*` from this app root before Next infers a parent folder as the workspace (local OPENAI_* etc.).
loadEnvConfig(projectRoot, process.env.NODE_ENV !== 'production');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
