import mailService from "./mailService";
import {exec} from "child_process";
import path from "path";
import pathStore from "../../../../pathStore";
import {promisify} from "util";
import {existsSync} from "fs";

describe('mailService', () => {
  test('constructor()', async () => {
    expect(mailService).toBeDefined()
  })

  test("getTemplateHtml()", async ()=> {
    let scriptPath = path.resolve(pathStore.scripts, 'generateMailTemplates.ts')

    await promisify(exec)(`pnpx ts-node ${scriptPath}`)

    let htmlPath = path.resolve(pathStore.mailer, 'src', 'template', '_test.html')

    expect(existsSync(htmlPath)).toEqual(true)
  })
})
