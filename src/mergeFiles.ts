import * as fs from 'fs'
import deepMerge from 'deepmerge'

export const validFile = (fileName: string): boolean => fileName !== ''

export const validFileThatExists = (fileName: string): boolean =>
  validFile(fileName) && fs.existsSync(fileName)

export function mergeFiles(
  baseFile: string,
  mergeFile: string,
  outputFile: string,
  combineArrays: boolean
) {
  let valid = true

  if (!validFileThatExists(baseFile)) {
    console.log(`Base json file is invalid or missing: "${baseFile}"`)
    valid = false
  }

  if (!validFileThatExists(mergeFile)) {
    console.log(`Merge json file is invalid or missing: "${mergeFile}"`)
    valid = false
  }

  if (!validFile(outputFile)) {
    console.log(`Output json file is invalid: "${outputFile}"`)
    valid = false
  }

  if (valid) {
    const baseJson = JSON.parse(
      fs.readFileSync(baseFile, { encoding: 'utf-8' })
    )
    const mergeJson = JSON.parse(
      fs.readFileSync(mergeFile, { encoding: 'utf-8' })
    )

    const options = combineArrays ? { arrayMerge: combineMerge } : {}
    const result = deepMerge.all([baseJson, mergeJson], options)

    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2))
  } else {
    throw new Error('Invalid request')
  }
}

const combineMerge = (target: any[], source: any[], options: any) => {
  const destination = target.slice()

  source.forEach((item, index) => {
    if (typeof destination[index] === 'undefined') {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item, options)
    } else if (options.isMergeableObject(item)) {
      destination[index] = deepMerge(target[index], item, options)
    } else if (target.indexOf(item) === -1) {
      destination.push(item)
    }
  })
  return destination
}
