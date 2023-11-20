import * as fs from 'fs'
import { mergeFiles } from '../src/mergeFiles'
import { expect } from '@jest/globals'

jest.mock('fs')

function toJSON<T>(data: T): string {
  return JSON.stringify(data, null, 2)
}

describe('mergeFiles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fails when given a file that doesnt exist', async () => {
    (<jest.Mock>fs.existsSync).mockReturnValue(false)
    expect(() =>
      mergeFiles('not-a-base-file.json', 'not-a-merge-file.json', 'output.json')
    ).toThrow('Invalid request')
  })

  it('fails when given an invalid output file', async () => {
    (<jest.Mock>fs.existsSync).mockReturnValue(true)
    expect(() =>
      mergeFiles('not-a-base-file.json', 'not-a-merge-file.json', '')
    ).toThrow('Invalid request')
  })

  it('merges different files correctly', async () => {
    (<jest.Mock>fs.existsSync).mockReturnValue(true);
    (<jest.Mock>fs.readFileSync).mockReturnValueOnce(toJSON({ "a": "aa" }));
    (<jest.Mock>fs.readFileSync).mockReturnValueOnce(toJSON({ "b": "bb" }));
    mergeFiles('mock-base-file.json', 'mock-merge-file.json', 'output.json')
    expect(<jest.Mock>fs.existsSync).toHaveBeenCalledTimes(2)
    expect(<jest.Mock>fs.readFileSync).toHaveBeenCalledTimes(2)
    expect(<jest.Mock>fs.writeFileSync).toHaveBeenCalledWith('output.json', toJSON({ "a": "aa", "b": "bb" }))
  })

  it('merges duplicate properties correctly', async () => {
    (<jest.Mock>fs.existsSync).mockReturnValue(true);
    (<jest.Mock>fs.readFileSync).mockReturnValueOnce(toJSON({ "a": "aa" }));
    (<jest.Mock>fs.readFileSync).mockReturnValueOnce(toJSON({ "a": "zz" }));
    mergeFiles('mock-base-file.json', 'mock-merge-file.json', 'output.json')
    expect(<jest.Mock>fs.existsSync).toHaveBeenCalledTimes(2)
    expect(<jest.Mock>fs.readFileSync).toHaveBeenCalledTimes(2)
    expect(<jest.Mock>fs.writeFileSync).toHaveBeenCalledWith('output.json', toJSON({ "a": "zz" }))
  })
})
