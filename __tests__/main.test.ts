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

jest.mock('@actions/core')
jest.mock('../src/mergeFiles')

describe('main', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls the mergeFiles function', async () => {
    await main.run()
    expect(<jest.Mock>core.getInput).toHaveBeenCalledTimes(4)
    expect(<jest.Mock>impl.mergeFiles).toHaveBeenCalled()
    expect(<jest.Mock>core.setOutput).toHaveBeenCalled()
  })

  it('handles exceptions correctly', async () => {
    ;(<jest.Mock>impl.mergeFiles).mockImplementation(() => {
      throw new Error('Boom')
    })
    await main.run()
    expect(<jest.Mock>core.getInput).toHaveBeenCalledTimes(4)
    expect(<jest.Mock>impl.mergeFiles).toHaveBeenCalled()
    expect(<jest.Mock>core.setFailed).toHaveBeenCalled()
  })
})
