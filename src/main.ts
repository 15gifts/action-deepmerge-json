import * as core from '@actions/core'
import { mergeFiles } from './mergeFiles'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const baseFile = core.getInput('base-file')
    const mergeFile = core.getInput('merge-file')
    const outputFile = core.getInput('output-file')

    mergeFiles(baseFile, mergeFile, outputFile)

    core.setOutput('Result', `Output written to: ${outputFile}`)
  }
  catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}