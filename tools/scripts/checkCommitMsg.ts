import * as fs from 'fs';

let msgPath = process.argv[2]
let msg = fs.readFileSync(msgPath, 'utf-8')

let msgArr = msg.split(' ')
let scope = msgArr[0]
let project = msgArr[1]
let issue = msgArr[msgArr.length - 1]
  .replace(/\n/, ``)
let summary = msg.replace(scope, ` `)
  .replace(project, ``)
  .replace(issue, ``)
  .replace(/ /g, ``)
let isValid = true

if(!/:.+:/.test(scope)) {
  console.log(`Scope ${scope} is not valid`)
  isValid = false
}

if(!/\[.+]:$/.test(project)) {
  console.log(`Project ${project} is not valid`)
  isValid = false
}

if(summary.length === 0) {
  console.log(`Summary should not be empty`)
  isValid = false
}

if(!/#[0-9]+$/.test(issue)) {
  console.log(`Issue number ${issue} is not valid`)
  isValid = false
}

if(!isValid) {
  throw 'commit msg format should be "<scope> [<project>]: <short-summary> #<issue-number>"'
}
