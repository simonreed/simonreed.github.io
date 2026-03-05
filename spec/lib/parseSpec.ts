import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import type { Spec } from './types'

function specsDir(): string {
  // specs/ lives at the repo root, one level above the Next.js app (spec/)
  return path.join(process.cwd(), '..', 'specs')
}

export function getAllSlugs(): string[] {
  const dir = specsDir()
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.spec.yaml'))
    .map((f) => f.replace('.spec.yaml', ''))
}

export function getSpec(slug: string): Spec | null {
  const filePath = path.join(specsDir(), `${slug}.spec.yaml`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const parsed = yaml.load(raw) as Spec
  return { ...parsed, slug }
}
