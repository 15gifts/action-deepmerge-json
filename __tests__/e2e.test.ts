import { ArrayMergeStrategy, mergeFiles } from '../src/mergeFiles'

describe('e2e', () => {
  it('run example merge', async () => {
    mergeFiles(
      '__tests__/examples/base.json',
      '__tests__/examples/merge.json',
      '__tests__/examples/output.json',
      ArrayMergeStrategy.MergeByIndex
    )
  })
})
