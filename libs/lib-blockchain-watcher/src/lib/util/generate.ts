import { readdir, readFile, writeFile } from 'fs-extra'
import * as path from 'path'
import pathStore from '@solomon/shared/util-path-store'
import mjml2html = require('mjml')

export const generateMjmlTemplate = async (): Promise<boolean> => {
  try {
    const templateDirPath = path.resolve(pathStore.watcher, 'src', 'template')
    const templateNames = await readdir(templateDirPath)

    for (let templateName of templateNames) {
      if (!templateName.endsWith('.mjml')) {
        continue
      }

      let templatePath = path.resolve(templateDirPath, templateName)
      let htmlName = templateName.replace('.mjml', '.html')
      let htmlPath = path.resolve(templateDirPath, htmlName)
      let template = await readFile(templatePath, 'utf-8')
      let mjmlParseResults = mjml2html(template)

      await writeFile(htmlPath, mjmlParseResults.html)
      console.log(`${htmlName} generated`)
    }
    return true
  } catch (_e) {
    console.log(_e)
    return false
  }
}
