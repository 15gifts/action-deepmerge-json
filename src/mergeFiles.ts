import * as fs from 'fs'
import deepMerge, { ArrayMergeOptions } from 'deepmerge'

export const validFile = (fileName: string): boolean => fileName !== ''

export const validFileThatExists = (fileName: string): boolean =>
  validFile(fileName) && fs.existsSync(fileName)

export enum ArrayMergeStrategy {
  CombineAll,
  OverwriteBaseArray,
  MergeByIndex,
  MergeByObjectName
}

export function mergeFiles(
  baseFile: string,
  mergeFile: string,
  outputFile: string,
  arrayMergeStrategy: ArrayMergeStrategy = ArrayMergeStrategy.CombineAll
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

    const options: deepMerge.Options = {
      arrayMerge: chooseArrayMergeOperation(arrayMergeStrategy)
    }
    const result = deepMerge.all([baseJson, mergeJson], options)

    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2))
  } else {
    throw new Error('Invalid request')
  }
}

type ArrayMergeOperation = (
  target: any[],
  source: any[],
  options: ArrayMergeOptions
) => any[]

function chooseArrayMergeOperation(
  arrayMergeStrategy: ArrayMergeStrategy
): ArrayMergeOperation | undefined {
  switch (arrayMergeStrategy) {
    case ArrayMergeStrategy.OverwriteBaseArray:
      return overwriteBaseArray
    case ArrayMergeStrategy.MergeByIndex:
      return mergeByIndex
    case ArrayMergeStrategy.CombineAll:
    default:
      return undefined
  }
}

function mergeByIndex(
  target: any[],
  source: any[],
  options: ArrayMergeOptions
): any[] {
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

function overwriteBaseArray(
  target: any[],
  source: any[],
  options: ArrayMergeOptions
): any[] {
  return source
}
