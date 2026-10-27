// Regenerate lib/database.types.ts from the self-hosted Supabase on the LMS server.
//
// postgres-meta (inside the stack) does the generation; we reach it over SSH, so
// no database port has to be exposed. Needs the EC2 key at the repo root
// (gitignored) or a path in ARLENE_SSH_KEY.
//
//   npm run types:gen
import { execFileSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const appDir = join(dirname(fileURLToPath(import.meta.url)), "..")
const key = process.env.ARLENE_SSH_KEY ?? join(appDir, "..", "arlene-ec2-key.pem")
const host = process.env.ARLENE_SSH_HOST ?? "ubuntu@3.101.143.234"

const fetchTypes =
  "fetch('http://meta:8080/generators/typescript?included_schemas=public')" +
  ".then(r=>{if(!r.ok)throw new Error('postgres-meta '+r.status);return r.text()})" +
  ".then(t=>process.stdout.write(t))"

const types = execFileSync(
  "ssh",
  ["-i", key, "-o", "BatchMode=yes", host, `docker exec supabase-studio node -e "${fetchTypes}"`],
  { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
)

// Write only a complete result, so a failed run never truncates the file.
if (!types.includes("export type Database")) {
  console.error("Unexpected generator output; lib/database.types.ts left unchanged.")
  process.exit(1)
}
writeFileSync(join(appDir, "lib", "database.types.ts"), types)
console.log(`lib/database.types.ts updated (${types.split("\n").length} lines)`)
