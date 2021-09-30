// Generate a filtered package.json according to rules in subset.config.js

const fs = require('fs')
const path = require('path')

const usage = () => {
  console.info(`
    Generate a package.json with dependencies filtered on
      a whitelist of package names.

    > node package-subset.js [target] [subsetFile] [pkgSource] [pkgDest]

    Example subset.config.js
      module.exports = {
        '[target]': {
          include: [
            'vite',
          ],
        },
      };
  `)
}

const errorExit = (reason) => {
  usage()
  console.error(reason)
  process.exit(1)
}

const checkParam = (param, reason) => {
  if (!param) {
    errorExit(reason)
  }
}

const filterDeps = (deps, include) => {
  const newDeps = {}
  for (const [dep, version] of Object.entries(deps)) {
    if (include.includes(dep)) {
      newDeps[dep] = version
    }
  }
  return newDeps
}

const target = process.argv[2]
checkParam(target !== '-h', 'Usage:')
checkParam(target, 'Missing target arg')

const subsetFile = process.argv[3]
checkParam(target, 'Missing subset file')

let subset
try {
  const subsetPath = path.resolve(subsetFile)
  checkParam(fs.existsSync(subsetPath), 'Subset file not found')

  subset = require(subsetPath)
  checkParam(subset && subset[target], `Target ${target} not found in subset.config.js`)
} catch (_e) {
  errorExit(`Unable to resolve subset file: ${subsetFile}`)
}

let pkg
let packageDestination
const packageSource = process.argv[4]
try {
  checkParam(packageSource, 'Missing source package.json location')

  packageDestination = process.argv[5]
  checkParam(packageDestination, 'Missing destination package.json location')

  pkg = require(path.resolve(packageSource))
} catch (_e) {
  errorExit(`Unable to resolve source package.json: ${packageSource}`)
}

const { dependencies, devDependencies } = pkg
const include = subset[target].include || []

if (dependencies) {
  pkg.dependencies = filterDeps(dependencies, include)
}

if (devDependencies) {
  pkg.devDependencies = filterDeps(devDependencies, include)
}

try {
  const destPath = path.resolve(packageDestination)
  fs.writeFileSync(destPath, JSON.stringify(pkg, null, 2))
  console.info(`Successfully wrote package subset to ${destPath}`)
} catch (_e) {
  errorExit('Failed to write to pkgDest')
}
