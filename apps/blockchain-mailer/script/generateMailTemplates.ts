import { readdir, readFile, writeFile } from "fs-extra";
import mjml2html from "mjml";
import path from "path";

let run = async ()=> {
  let templateDirPath = path.resolve(__dirname, '..', 'template')
  let templateNames = await readdir(templateDirPath)

  for(let templateName of templateNames) {

    if(!templateName.endsWith('.mjml')) {
      continue
    }

    let templatePath = path.resolve(templateDirPath, templateName)
    let htmlName = templateName.replace('.mjml', '.html')
    let htmlPath = path.resolve(templateDirPath, htmlName)
    let template = await readFile(templatePath, 'utf-8')
    let mjmlParseResults = mjml2html(template)

    await writeFile(htmlPath, mjmlParseResults.html)
  }
}

run()
