import * as fs from 'fs'
import { ArrayMergeStrategy, mergeFiles } from '../src/mergeFiles'
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
    ;(<jest.Mock>fs.existsSync).mockReturnValue(false)
    expect(() =>
      mergeFiles('not-a-base-file.json', 'not-a-merge-file.json', 'output.json')
    ).toThrow('Invalid request')
  })

  it('fails when given an invalid output file', async () => {
    ;(<jest.Mock>fs.existsSync).mockReturnValue(true)
    expect(() =>
      mergeFiles('not-a-base-file.json', 'not-a-merge-file.json', '')
    ).toThrow('Invalid request')
  })

  it('merges different files correctly', async () => {
    ;(<jest.Mock>fs.existsSync).mockReturnValue(true)
    ;(<jest.Mock>fs.readFileSync).mockReturnValueOnce(toJSON({ a: 'aa' }))
    ;(<jest.Mock>fs.readFileSync).mockReturnValueOnce(toJSON({ b: 'bb' }))
    mergeFiles('mock-base-file.json', 'mock-merge-file.json', 'output.json')
    expect(<jest.Mock>fs.existsSync).toHaveBeenCalledTimes(2)
    expect(<jest.Mock>fs.readFileSync).toHaveBeenCalledTimes(2)
    expect(<jest.Mock>fs.writeFileSync).toHaveBeenCalledWith(
      'output.json',
      toJSON({ a: 'aa', b: 'bb' })
    )
  })

  it('merges duplicate properties correctly', async () => {
    ;(<jest.Mock>fs.existsSync).mockReturnValue(true)
    ;(<jest.Mock>fs.readFileSync).mockReturnValueOnce(toJSON({ a: 'aa' }))
    ;(<jest.Mock>fs.readFileSync).mockReturnValueOnce(toJSON({ a: 'zz' }))
    mergeFiles('mock-base-file.json', 'mock-merge-file.json', 'output.json')
    expect(<jest.Mock>fs.existsSync).toHaveBeenCalledTimes(2)
    expect(<jest.Mock>fs.readFileSync).toHaveBeenCalledTimes(2)
    expect(<jest.Mock>fs.writeFileSync).toHaveBeenCalledWith(
      'output.json',
      toJSON({ a: 'zz' })
    )
  })

  it('can merge arrays using the default combine-all strategy', async () => {
    ;(<jest.Mock>fs.existsSync).mockReturnValue(true)
    ;(<jest.Mock>fs.readFileSync).mockReturnValueOnce(
      toJSON({
        properties: [
          {
            name: 'prop1',
            value: 'value1'
          },
          {
            name: 'prop2',
            value: 'value2'
          }
        ]
      })
    )
    ;(<jest.Mock>fs.readFileSync).mockReturnValueOnce(
      toJSON({
        properties: [
          {
            name: 'prop3',
            value: 'value3'
          },
          {
            name: 'prop4',
            value: 'value4'
          }
        ]
      })
    )
    mergeFiles('mock-base-file.json', 'mock-merge-file.json', 'output.json')
    expect(<jest.Mock>fs.writeFileSync).toHaveBeenCalledWith(
      'output.json',
      toJSON({
        properties: [
          {
            name: 'prop1',
            value: 'value1'
          },
          {
            name: 'prop2',
            value: 'value2'
          },
          {
            name: 'prop3',
            value: 'value3'
          },
          {
            name: 'prop4',
            value: 'value4'
          }
        ]
      })
    )
  })

  it('can merge arrays using merge-by-index strategy', async () => {
    ;(<jest.Mock>fs.existsSync).mockReturnValue(true)
    ;(<jest.Mock>fs.readFileSync).mockReturnValueOnce(
      toJSON({
        properties: [
          {
            name: 'prop1',
            value: 'value1'
          },
          {
            name: 'prop2',
            value: 'value2'
          },
          {
            name: 'prop3',
            value: 'value3'
          }
        ]
      })
    )
    ;(<jest.Mock>fs.readFileSync).mockReturnValueOnce(
      toJSON({
        properties: [
          {
            name: 'prop1',
            value: 'value1-modified',
            scope: 'test'
          },
          {
            name: 'prop2',
            value: 'value2-modified'
          }
        ]
      })
    )
    mergeFiles(
      'mock-base-file.json',
      'mock-merge-file.json',
      'output.json',
      ArrayMergeStrategy.MergeByIndex
    )
    expect(<jest.Mock>fs.writeFileSync).toHaveBeenCalledWith(
      'output.json',
      toJSON({
        properties: [
          {
            name: 'prop1',
            value: 'value1-modified',
            scope: 'test'
          },
          {
            name: 'prop2',
            value: 'value2-modified'
          },
          {
            name: 'prop3',
            value: 'value3'
          }
        ]
      })
    )
  })

  it('can merge arrays using overwrite-base-array strategy', async () => {
    ;(<jest.Mock>fs.existsSync).mockReturnValue(true)
    ;(<jest.Mock>fs.readFileSync).mockReturnValueOnce(
      toJSON({
        properties: [
          {
            name: 'prop1',
            value: 'value1'
          },
          {
            name: 'prop2',
            value: 'value2'
          },
          {
            name: 'prop3',
            value: 'value3'
          }
        ]
      })
    )
    ;(<jest.Mock>fs.readFileSync).mockReturnValueOnce(
      toJSON({
        properties: [
          {
            name: 'prop1',
            value: 'value1-modified',
            scope: 'test'
          },
          {
            name: 'prop2',
            value: 'value2-modified'
          }
        ]
      })
    )
    mergeFiles(
      'mock-base-file.json',
      'mock-merge-file.json',
      'output.json',
      ArrayMergeStrategy.OverwriteBaseArray
    )
    expect(<jest.Mock>fs.writeFileSync).toHaveBeenCalledWith(
      'output.json',
      toJSON({
        properties: [
          {
            name: 'prop1',
            value: 'value1-modified',
            scope: 'test'
          },
          {
            name: 'prop2',
            value: 'value2-modified'
          }
        ]
      })
    )
  })
})
