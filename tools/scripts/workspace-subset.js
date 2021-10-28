// Generate a filtered workspace.json according to rules in subset.config.js

const fs = require('fs')
const path = require('path')

const usage = () => {
  console.info(`
    Generate a workspace.json that only includes the specified target app and
      related libraries. "libs/shared" and "libs/<target>" are automatically included.

    > node workspace-subset.js [target] [subsetFile] [workspaceSource] [workspaceDest]

    Example subset.config.js
      module.exports = {
        '[target]': {
          workspace: [
            'libs/web',
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

let workspace
let workspaceDestination
const workspaceSource = process.argv[4]
try {
  checkParam(workspaceSource, 'Missing source workspace.json location')

  workspaceDestination = process.argv[5]
  checkParam(workspaceDestination, 'Missing destination workspace.json location')

  workspace = require(path.resolve(workspaceSource))
} catch (_e) {
  errorExit(`Unable to resolve source workspace.json: ${workspaceSource}`)
}

const { projects } = workspace
const targetApp = `apps/${target}`
const targetLib = `libs/${target}`
let include = ['libs/shared', ...(subset[target].workspace || [])]

if (projects) {
  const newProjects = {}
  for (const [project, relPath] of Object.entries(projects)) {
    const keep =
      relPath === targetApp ||
      relPath === targetLib ||
      include.some((p) => relPath.startsWith(p))
    if (keep) {
      newProjects[project] = relPath
    }
  }
  workspace.projects = newProjects
}

try {
  const destPath = path.resolve(workspaceDestination)
  fs.writeFileSync(destPath, JSON.stringify(workspace, null, 2))
  console.info(`Successfully wrote workspace subset to ${destPath}`)
} catch (_e) {
  errorExit('Failed to write to workspaceDest')
}
