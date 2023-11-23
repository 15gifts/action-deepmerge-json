import * as core from '@actions/core'
import { ArrayMergeStrategy, mergeFiles } from './mergeFiles'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const baseFile = core.getInput('base-file')
    const mergeFile = core.getInput('merge-file')
    const outputFile = core.getInput('output-file')
    const arrayMergeStrategy: ArrayMergeStrategy =
      ArrayMergeStrategy[
        core.getInput('array-merge-strategy') as keyof typeof ArrayMergeStrategy
      ]

    // Debug log inputs
    core.debug(`baseFile: ${baseFile}`)
    core.debug(`mergeFile: ${mergeFile}`)
    core.debug(`outputFile: ${outputFile}`)
    core.debug(`arrayMergeStrategy: ${arrayMergeStrategy}`)

    // Do merge
    mergeFiles(baseFile, mergeFile, outputFile, arrayMergeStrategy)

    core.setOutput('Result', `Output written to: ${outputFile}`)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
