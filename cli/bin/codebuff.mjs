#!/usr/bin/env node
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { spawn } from "child_process"
import { existsSync } from "fs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const cliRoot = join(__dirname, "..")
const entryPoint = join(cliRoot, "src", "index.tsx")

const tsxPaths = [
  join(cliRoot, "node_modules", ".bin", "tsx"),
  join(cliRoot, "..", "node_modules", ".bin", "tsx"),
]
let runner = tsxPaths.find(p => existsSync(p))
if (!runner) runner = "npx"
const args = runner === "npx" ? ["tsx", entryPoint, ...process.argv.slice(2)] : [entryPoint, ...process.argv.slice(2)]

const child = spawn(runner, args, {
  stdio: "inherit",
  env: { ...process.env, CODEBUFF_IS_BINARY: "false" },
})
child.on("exit", (code) => process.exit(code ?? 1))
child.on("error", (err) => {
  console.error("Failed to start Codebuff:", err.message)
  console.error("Install tsx: npm install -D tsx")
  process.exit(1)
})
