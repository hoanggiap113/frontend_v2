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
  'src/types',
  'src/hooks',
  'src/store',
  'src/routes',
  'src/services',
  'src/shared',
]

for (const folder of legacyFolders) {
  if (fs.existsSync(path.join(root, folder))) {
    errors.push(
      `${folder} vẫn tồn tại. Hãy đặt code vào feature, components, services, lib, app hoặc router.`,
    )
  }
}

const componentRoot = path.join(srcRoot, 'components')
for (const entry of fs.readdirSync(componentRoot, { withFileTypes: true })) {
  if (entry.isFile() && entry.name !== 'index.ts') {
    errors.push(
      `src/components/${entry.name}: component phải nằm trong một folder chức năng.`,
    )
  }
  if (entry.isDirectory() && entry.name !== 'ui') {
    errors.push(
      `src/components/${entry.name}: components chỉ dành cho UI dùng chung; code theo chức năng phải về app, router hoặc feature.`,
    )
  }
}

for (const entrypoint of walk(componentRoot).filter(
  (file) =>
    path.basename(file) === 'index.ts' &&
    file !== path.join(componentRoot, 'index.ts'),
)) {
  errors.push(
    `${relative(entrypoint)}: components chỉ sử dụng public API src/components/index.ts.`,
  )
}

const featureNames = fs
  .readdirSync(featureRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

for (const feature of featureNames) {
  const directory = path.join(featureRoot, feature)
  const publicApi = path.join(directory, 'index.ts')
  const nestedEntrypoints = walk(directory).filter(
    (file) => path.basename(file) === 'index.ts' && file !== publicApi,
  )
  for (const entrypoint of nestedEntrypoints) {
    errors.push(
      `${relative(entrypoint)}: feature chỉ nên có một public API tại ` +
        `src/features/${feature}/index.ts.`,
    )
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
    ...['.ts', '.tsx', '.js', '.jsx'].map(
      (extension) => `${basePath}${extension}`,
    ),
    ...['index.ts', 'index.tsx', 'index.js', 'index.jsx'].map((indexFile) =>
      path.join(basePath, indexFile),
    ),
  ]

  return (
    candidates.find(
      (candidate) =>
        fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
    ) ?? null
  )
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

for (const file of walk(srcRoot).filter((item) =>
  codeExtensions.has(path.extname(item)),
)) {
  const filePath = relative(file)
  const source = fs.readFileSync(file, 'utf8')
  const ownFeatureMatch = filePath.match(/^src\/features\/([^/]+)\//)
  const ownFeature = ownFeatureMatch?.[1]

  if (
    /\.service\.[jt]sx?$/.test(filePath) &&
    !filePath.startsWith('src/lib/services/')
  ) {
    errors.push(`${filePath}: service phải được đặt trong src/lib/services.`)
  }
  if (
    /\.queries\.[jt]sx?$/.test(filePath) &&
    !filePath.startsWith('src/lib/hooks/')
  ) {
    errors.push(`${filePath}: query hook phải được đặt trong src/lib/hooks.`)
  }
  if (
    /helper\.[jt]sx?$/.test(filePath) &&
    !filePath.startsWith('src/lib/helpers/')
  ) {
    errors.push(`${filePath}: helper phải được đặt trong src/lib/helpers.`)
  }
  if (filePath.endsWith('/utils.ts') && filePath !== 'src/lib/utils.ts') {
    errors.push(`${filePath}: utility phải được gom vào src/lib/utils.ts.`)
  }

  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1]
    const isInternalImport =
      specifier.startsWith('#/') ||
      specifier.startsWith('@/') ||
      specifier.startsWith('.')
    const resolvedImport = isInternalImport
      ? resolveInternalImport(file, specifier)
      : null

    if (isInternalImport && !resolvedImport) {
      errors.push(`${filePath}: import không tồn tại (${specifier}).`)
      continue
    }

    const layerRules = [
      {
        path: 'src/lib/types/',
        forbiddenPaths: [
          'src/app/',
          'src/components/',
          'src/features/',
          'src/lib/services/',
        ],
      },
      {
        path: 'src/components/',
        forbiddenPaths: ['src/app/', 'src/features/', 'src/lib/services/'],
      },
      {
        path: 'src/lib/services/',
        forbiddenPaths: ['src/app/', 'src/components/', 'src/features/'],
      },
      {
        path: 'src/lib/hooks/',
        forbiddenPaths: ['src/app/', 'src/components/', 'src/features/'],
      },
    ]

    for (const rule of layerRules) {
      const dependencyPath = resolvedImport ? relative(resolvedImport) : ''
      if (
        filePath.startsWith(rule.path) &&
        rule.forbiddenPaths.some((prefix) => dependencyPath.startsWith(prefix))
      ) {
        errors.push(
          `${filePath}: ${rule.path} không được phụ thuộc vào ${specifier}.`,
        )
      }
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
      const isRouterPageImport =
        filePath.startsWith('src/router/') &&
        /^\/(?:pages\/)?[^/]+Page$/.test(deepPath)
      const isAppSliceImport =
        filePath === 'src/app/store/index.ts' && /\/[^/]+Slice$/.test(deepPath)

      if (!isRouterPageImport && !isAppSliceImport) {
        errors.push(
          `${filePath}: chỉ được sử dụng public API ` +
            `#/features/${importedFeature} (${specifier}).`,
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
