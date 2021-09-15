import {readdir, readFile, writeFile} from "fs-extra";
import * as path from "path";
import pathStore from "../../pathStore";
import mjml2html = require("mjml");

let run = async ()=> {
  let templateDirPath = path.resolve(pathStore.mailer, 'src', 'template')
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
    console.log(`${htmlName} generated`)
  }
}

run()
