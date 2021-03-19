/**
 * Make all the pages files
 *
 */

import path from 'path'
import camelCase from 'camelcase'
import extractJSX from './tasks/extractJSX'
import runFactory from './tasks/makerFactory'
// import processAllPartsFile from './tasks/processAllPartsFile'
import packpath from 'packpath'

const enabled = false

// Disabled=0 due to that this will be a manual ting in future
if (
  enabled &&
  require.main === module &&
  process.env.NODE_ENV !== 'test'
) {
  const ignoreUiLibList = ['web-components', 'style']
  const filterOut = [] // before we had in here: 'input-masked', 'icon-primary'
  const keepFiles = [] //'!**/footer/*'
  // const autoAdvice = `
  // ATTENTION: This file is auto generated by using "makeDemosFactory".
  // Do not change the content!
  //   `

  // make components demos
  runFactory({
    removeFiles: true,
    templateNameToRename: 'Template',
    tempalteFilePath: path.resolve(
      packpath.self(),
      './src/uilib/components/demos/Template.js'
    ),
    processToNamesList: path.resolve(
      path.dirname(require.resolve('@dnb/eufemia')),
      'src/components/'
    ),
    processToNamesIgnoreList: ignoreUiLibList,
    processToNamesListByUsingFolders: true,
    processDestFilePath: path.resolve(
      packpath.self(),
      './src/uilib/components/demos'
    ),
    prepareDestFileCallback: (file) =>
      camelCase(file, { pascalCase: true })
  }).then((files) => {
    // processAllPartsFile('components', files, {
    //   autoAdvice: `
    //     /** ${autoAdvice} */
    //   `
    // })

    extractJSX('components', files)
  })

  // make components pages
  runFactory({
    removeFiles: keepFiles,
    templateNameToRename: 'Template',
    tempalteFilePath: path.resolve(
      packpath.self(),
      // './src/docs/uilib/components/template.md' // we can not have a template inside here, else it will be a valid page
      './src/uilib/components/page-template.md'
    ),
    processDestFileExt: '.md',
    processDestFileContent: (content, i) => `${content.replace(
      /(order: )([0-9])/g,
      `$1${i + 1}`
    )}
    `,
    processToNamesIgnoreList: ignoreUiLibList, // in case we want to remove an additional component form the menu list: .concat(['body'])
    processToNamesList: path.resolve(
      path.dirname(require.resolve('@dnb/eufemia')),
      'src/components/'
    ),
    processToNamesListByUsingFolders: true,
    processDestFilePath: path.resolve(
      packpath.self(),
      './src/docs/uilib/components'
    ),
    preprocessContent: ({ file, content }) => {
      if (
        filterOut.length > 0 &&
        new RegExp(filterOut.join('|')).test(file)
      ) {
        return content.replace('draft: false', 'draft: true')
      }
      return content
    },
    prepareDestFileCallback: (file) => file.toLowerCase()
  })

  // make extensions demos
  runFactory({
    // removeFiles: true,
    templateNameToRename: 'Template',
    tempalteFilePath: path.resolve(
      packpath.self(),
      './src/uilib/extensions/demos/Template.js'
    ),
    processToNamesList: path.resolve(
      path.dirname(require.resolve('@dnb/eufemia')),
      'src/extensions/'
    ),
    processToNamesIgnoreList: ignoreUiLibList,
    processToNamesListByUsingFolders: true,
    processDestFilePath: path.resolve(
      packpath.self(),
      './src/uilib/extensions/demos'
    ),
    prepareDestFileCallback: (file) =>
      camelCase(file, { pascalCase: true })
  }).then((files) => {
    // processAllPartsFile('extensions', files, {
    //   autoAdvice: `
    //       /** ${autoAdvice} */
    //     `
    // })
    extractJSX('extensions', files)
  })

  // make extensions pages
  runFactory({
    removeFiles: keepFiles,
    templateNameToRename: 'Template',
    tempalteFilePath: path.resolve(
      packpath.self(),
      // './src/docs/uilib/extensions/template.md' // we can not have a template inside here, else it will be a valid page
      './src/uilib/extensions/page-template.md'
    ),
    processDestFileExt: '.md',
    processDestFileContent: (content, i) => `${content.replace(
      /(order: )([0-9])/g,
      `$1${i + 1}`
    )}
    `,
    processToNamesIgnoreList: ignoreUiLibList,
    processToNamesList: path.resolve(
      path.dirname(require.resolve('@dnb/eufemia')),
      'src/extensions/'
    ),
    processToNamesListByUsingFolders: true,
    processDestFilePath: path.resolve(
      packpath.self(),
      './src/docs/uilib/extensions'
    ),
    prepareDestFileCallback: (file) => file.toLowerCase()
  })
}

// for testing proposes
export { runFactory }
