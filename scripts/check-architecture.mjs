import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const srcRoot = path.join(root, 'src')
const featureRoot = path.join(srcRoot, 'features')
const errors = []
const codeExtensions = new Set(['.ts', '.tsx', '.js', '.jsx'])

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(fullPath) : [fullPath]
  })
}

function relative(file) {
  return path.relative(root, file).replaceAll('\\', '/')
}

const legacyFolders = [
  'src/pages',
  'src/components',
  'src/services',
  'src/types',
  'src/lib',
  'src/hooks',
  'src/store',
  'src/routes',
]

for (const folder of legacyFolders) {
  if (fs.existsSync(path.join(root, folder))) {
    errors.push(`${folder} vẫn tồn tại. Hãy đặt code vào feature, shared, app hoặc router.`)
  }
}

const featureNames = fs
  .readdirSync(featureRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

for (const feature of featureNames) {
  const directory = path.join(featureRoot, feature)
  for (const required of ['components', 'hooks', 'service', 'lib', 'pages']) {
    const requiredDirectory = path.join(directory, required)
    if (!fs.existsSync(requiredDirectory)) {
      errors.push(`Feature ${feature} thiếu folder ${required}.`)
      continue
    }
    if (!fs.existsSync(path.join(requiredDirectory, 'index.ts'))) {
      errors.push(`Feature ${feature}/${required} thiếu entrypoint index.ts.`)
    }
  }

  const publicApi = path.join(directory, 'index.ts')
  if (!fs.existsSync(publicApi)) {
    errors.push(`Feature ${feature} thiếu public API index.ts.`)
  } else if (fs.readFileSync(publicApi, 'utf8').includes("'./pages'")) {
    errors.push(`Feature ${feature}: public API root không được export pages.`)
  }
}

const importPattern = /(?:from\s*|import\s*\(\s*)['"]([^'"]+)['"]/g

function resolveInternalImport(file, specifier) {
  let basePath
  if (specifier.startsWith('#/')) {
    basePath = path.join(srcRoot, specifier.slice(2))
  } else if (specifier.startsWith('@/')) {
    basePath = path.join(srcRoot, specifier.slice(2))
  } else if (specifier.startsWith('.')) {
    basePath = path.resolve(path.dirname(file), specifier)
  } else {
    return null
  }

  const candidates = [
    basePath,
    ...['.ts', '.tsx', '.js', '.jsx'].map((extension) => `${basePath}${extension}`),
    ...['index.ts', 'index.tsx', 'index.js', 'index.jsx'].map((indexFile) =>
      path.join(basePath, indexFile),
    ),
  ]

  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ?? null
}

function findDependencyCycles(files) {
  const graph = new Map(files.map((file) => [file, []]))

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8')
    for (const match of source.matchAll(importPattern)) {
      const dependency = resolveInternalImport(file, match[1])
      if (dependency && graph.has(dependency)) graph.get(file).push(dependency)
    }
  }

  const state = new Map()
  const stack = []
  const reported = new Set()

  function visit(file) {
    state.set(file, 1)
    stack.push(file)

    for (const dependency of graph.get(file)) {
      if (!state.has(dependency)) {
        visit(dependency)
        continue
      }

      if (state.get(dependency) === 1) {
        const cycleStart = stack.indexOf(dependency)
        const cycle = [...stack.slice(cycleStart), dependency].map(relative)
        const signature = [...new Set(cycle.slice(0, -1))].sort().join('|')
        if (!reported.has(signature)) {
          reported.add(signature)
          errors.push(`Phát hiện dependency cycle: ${cycle.join(' -> ')}`)
        }
      }
    }

    stack.pop()
    state.set(file, 2)
  }

  for (const file of files) {
    if (!state.has(file)) visit(file)
  }
}

for (const file of walk(srcRoot).filter((item) => codeExtensions.has(path.extname(item)))) {
  const filePath = relative(file)
  const source = fs.readFileSync(file, 'utf8')
  const ownFeatureMatch = filePath.match(/^src\/features\/([^/]+)\//)
  const ownFeature = ownFeatureMatch?.[1]

  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1]

    if (filePath.startsWith('src/shared/') && specifier.startsWith('#/features/')) {
      errors.push(`${filePath}: shared không được phụ thuộc vào feature (${specifier}).`)
    }

    if (filePath.startsWith('src/shared/') && specifier.startsWith('#/app/')) {
      errors.push(`${filePath}: shared không được phụ thuộc vào app (${specifier}).`)
    }

    const featureImport = specifier.match(/^#\/features\/([^/]+)(\/.*)?$/)
    if (!featureImport) continue

    const importedFeature = featureImport[1]
    const deepPath = featureImport[2]

    if (ownFeature === importedFeature) {
      errors.push(
        `${filePath}: file nội bộ feature phải dùng relative import thay vì ${specifier}.`,
      )
      continue
    }

    if (deepPath) {
      const entrypoint = deepPath.slice(1).split('/')[0]
      const isRouterPageEntrypoint =
        filePath.startsWith('src/router/') && entrypoint === 'pages'
      const isAppEntrypoint =
        filePath.startsWith('src/app/') && ['service', 'store'].includes(entrypoint)

      if (!isRouterPageEntrypoint && !isAppEntrypoint) {
        errors.push(
          `${filePath}: chỉ được sử dụng public API #/features/${importedFeature}; ` +
            `router chỉ được dùng /pages và app chỉ được dùng /service hoặc /store (${specifier}).`,
        )
      }
    }
  }
}

findDependencyCycles(
  walk(srcRoot).filter((item) => codeExtensions.has(path.extname(item))),
)

if (errors.length > 0) {
  console.error('\nArchitecture validation failed:\n')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(`Architecture valid: ${featureNames.length} features checked.`)
