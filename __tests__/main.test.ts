/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import * as impl from '../src/mergeFiles'
import { ArrayMergeStrategy } from '../src/mergeFiles'

jest.mock('@actions/core')
jest.mock('../src/mergeFiles')

describe('main', () => {
  const castAsMock = (t: any): jest.Mock => t as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls the mergeFiles function', async () => {
    await main.run()

    expect(core.getInput).toHaveBeenCalledTimes(4)
    expect(impl.mergeFiles).toHaveBeenCalled()
    expect(core.setOutput).toHaveBeenCalled()
  })

  it('handles exceptions correctly', async () => {
    castAsMock(impl.mergeFiles).mockImplementation(() => {
      throw new Error('Boom')
    })

    await main.run()

    expect(core.getInput).toHaveBeenCalledTimes(4)
    expect(impl.mergeFiles).toHaveBeenCalled()
    expect(core.setFailed).toHaveBeenCalled()
  })

  it('parses inputs correctly', async () => {
    castAsMock(core.getInput).mockReturnValueOnce('base-file.json')
    castAsMock(core.getInput).mockReturnValueOnce('merge-file.json')
    castAsMock(core.getInput).mockReturnValueOnce('output-file.json')
    castAsMock(core.getInput).mockReturnValueOnce('OverwriteBaseArray')
    castAsMock(impl.mergeFiles).mockImplementation(() => {})

    await main.run()

    expect(impl.mergeFiles).toHaveBeenCalledWith(
      'base-file.json',
      'merge-file.json',
      'output-file.json',
      ArrayMergeStrategy.OverwriteBaseArray
    )
    expect(core.setFailed).not.toHaveBeenCalled()
    expect(core.setOutput).toHaveBeenCalled()
  })

  it('parses inputs correctly, when no array merge strategy given', async () => {
    castAsMock(core.getInput).mockReturnValueOnce('base-file.json')
    castAsMock(core.getInput).mockReturnValueOnce('merge-file.json')
    castAsMock(core.getInput).mockReturnValueOnce('output-file.json')
    castAsMock(core.getInput).mockReturnValueOnce(undefined)
    castAsMock(impl.mergeFiles).mockImplementation(() => {})

    await main.run()

    expect(impl.mergeFiles).toHaveBeenCalledWith(
      'base-file.json',
      'merge-file.json',
      'output-file.json',
      undefined
    )
    expect(core.setFailed).not.toHaveBeenCalled()
    expect(core.setOutput).toHaveBeenCalled()
  })
})
