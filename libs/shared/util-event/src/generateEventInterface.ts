import { compile, compileFromFile } from 'json-schema-to-typescript'
import { readFile, write, writeFile } from "fs-extra";
import path from "path";
import { readdir } from "fs-extra";

export const generateEventInterface = async ()=> {
  const interfaceFolderPath = path.resolve(__dirname, '..', 'interface')
  const schemaFolderPath = path.resolve(__dirname, '..', 'schema')
  const schemaFileNames = await readdir(schemaFolderPath)
  let indexStr = ``

  for(let schemaFileName of schemaFileNames) {
    try {
      const schemaFilePath = path.resolve(schemaFolderPath, schemaFileName)
      const interfaceFileName = schemaFileName.replace('.schema.json', '.schema.ts')
      const interfaceFilePath = path.resolve(interfaceFolderPath, interfaceFileName)

      let interfaceStr = await compileFromFile(schemaFilePath, {
        unreachableDefinitions: true,
      })

      interfaceStr = interfaceStr.replace(/\[k: string]: unknown;/g, ``)

      await writeFile(interfaceFilePath, interfaceStr, 'utf-8')
      indexStr += `export * from '../interface/${interfaceFileName.replace('.ts', '')}'\n`
      console.log(`${interfaceFilePath} generated.`)
    } catch (err) {
      console.error(err)
      console.log(`${schemaFileName} generate fail.`)
    }
  }

  await writeFile(path.resolve(__dirname, 'index.ts'), indexStr)
}
