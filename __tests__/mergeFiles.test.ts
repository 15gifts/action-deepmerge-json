import * as fs from 'fs'
import { ArrayMergeStrategy, mergeFiles } from '../src/mergeFiles'
import { expect } from '@jest/globals'

jest.mock('fs')

function toJSON<T>(data: T): string {
  return JSON.stringify(data, null, 2)
}

describe('mergeFiles', () => {
  const castAsMock = (t: any): jest.Mock => t as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fails when given a file that doesnt exist', async () => {
    castAsMock(fs.existsSync).mockReturnValue(false)

    expect(() =>
      mergeFiles('not-a-base-file.json', 'not-a-merge-file.json', 'output.json')
    ).toThrow('Invalid request')
  })

  it('fails when given an invalid output file', async () => {
    castAsMock(fs.existsSync).mockReturnValue(true)

    expect(() =>
      mergeFiles('not-a-base-file.json', 'not-a-merge-file.json', '')
    ).toThrow('Invalid request')
  })

  it('merges different files correctly', async () => {
    castAsMock(fs.existsSync).mockReturnValue(true)
    castAsMock(fs.readFileSync).mockReturnValueOnce(toJSON({ a: 'aa' }))
    castAsMock(fs.readFileSync).mockReturnValueOnce(toJSON({ b: 'bb' }))

    mergeFiles('mock-base-file.json', 'mock-merge-file.json', 'output.json')

    expect(fs.existsSync).toHaveBeenCalledTimes(2)
    expect(fs.readFileSync).toHaveBeenCalledTimes(2)
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'output.json',
      toJSON({ a: 'aa', b: 'bb' })
    )
  })

  it('merges duplicate properties correctly', async () => {
    castAsMock(fs.existsSync).mockReturnValue(true)
    castAsMock(fs.readFileSync).mockReturnValueOnce(toJSON({ a: 'aa' }))
    castAsMock(fs.readFileSync).mockReturnValueOnce(toJSON({ a: 'zz' }))

    mergeFiles('mock-base-file.json', 'mock-merge-file.json', 'output.json')

    expect(fs.existsSync).toHaveBeenCalledTimes(2)
    expect(fs.readFileSync).toHaveBeenCalledTimes(2)
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'output.json',
      toJSON({ a: 'zz' })
    )
  })

  it('can merge arrays using the default combine-all strategy', async () => {
    castAsMock(fs.existsSync).mockReturnValue(true)
    castAsMock(fs.readFileSync).mockReturnValueOnce(
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
    castAsMock(fs.readFileSync).mockReturnValueOnce(
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

    expect(fs.writeFileSync).toHaveBeenCalledWith(
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
    castAsMock(fs.existsSync).mockReturnValue(true)
    castAsMock(fs.readFileSync).mockReturnValueOnce(
      toJSON({
        properties: [
          {
            name: 'prop1',
            value: 'value1',
            scope: 'test'
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
    castAsMock(fs.readFileSync).mockReturnValueOnce(
      toJSON({
        properties: [
          {
            name: 'propA',
            value: 'valueA'
          },
          {
            name: 'propB',
            value: 'valueB'
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

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'output.json',
      toJSON({
        properties: [
          {
            name: 'propA',
            value: 'valueA',
            scope: 'test'
          },
          {
            name: 'propB',
            value: 'valueB'
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
    castAsMock(fs.existsSync).mockReturnValue(true)
    castAsMock(fs.readFileSync).mockReturnValueOnce(
      toJSON({
        properties: [
          {
            name: 'prop1',
            value: 'value1',
            scope: 'test'
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
    castAsMock(fs.readFileSync).mockReturnValueOnce(
      toJSON({
        properties: [
          {
            name: 'prop1',
            value: 'value1-modified'
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

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'output.json',
      toJSON({
        properties: [
          {
            name: 'prop1',
            value: 'value1-modified'
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
