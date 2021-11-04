import { compile, compileFromFile } from 'json-schema-to-typescript'
import { write, writeFile } from "fs-extra";
import path from "path";

export const generateEventInterface = async ()=> {
  let res = await compileFromFile(path.resolve(__dirname, '..', '_sample.schema.json'))
  await writeFile(path.resolve(__dirname, 'test.schema.ts'), res, 'utf-8')
}
