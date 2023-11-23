# DeepMerge JSON

[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

This github action allows you to use the deepmerge library to combine two JSON files into one.

Parameters are:

  * base-file:
    * description: 'Base json file'
    * required: true

  * merge-file:
    * description: 'Merge json file to overlay onto base'
    * required: true

  * output-file:
    * description: 'Output json file for the combined results'
    * required: true

  * array-merge-strategy:
    * description: 'Array merge strategy'
    * required: false

The following merge strategies are implemented:

  * CombineAll (default)
    * Combines all items from both arrays into the output

  * OverwriteBaseArray
    * Replaces the contents of arrays with only the values from the 'merge' file

  * MergeByIndex
    * Merges the array items by index, so item 1 from base array will be deep-merged with item 1 from merge array, etc.
