import { compile, compileFromFile } from 'json-schema-to-typescript'
import { write, writeFile } from "fs-extra";
import path from "path";

export const generateEventInterface = async ()=> {
  let res = await compileFromFile('_sample.schema.json')
  await writeFile(res, path.resolve(__dirname, 'test.ts'), 'utf-8')
}
