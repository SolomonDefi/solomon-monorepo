import { readdir, readFile, writeFile } from 'fs-extra'
import * as path from 'path'
import mjml2html from 'mjml'
import { pathStore } from '@solomon/shared/store-path'

export const generateMjmlTemplate = async (): Promise<boolean> => {
  try {
    const templateDirPath = pathStore.mailTemplates
    const templateNames = await readdir(templateDirPath)

    for (const templateName of templateNames) {
      if (!templateName.endsWith('.mjml')) {
        continue
      }

      const templatePath = path.resolve(templateDirPath, templateName)
      const htmlName = templateName.replace('.mjml', '.html')
      const htmlPath = path.resolve(templateDirPath, htmlName)
      const template = await readFile(templatePath, 'utf-8')
      const mjmlParseResults = mjml2html(template)

      await writeFile(htmlPath, mjmlParseResults.html)
      console.log(`${htmlName} generated`)
    }
    return true
  } catch (_e) {
    console.log(_e)
    return false
  }
}
