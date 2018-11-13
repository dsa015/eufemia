/**
 * Insert all the component themes into the main themes lib files
 *
 */

import fs from 'fs-extra'
import globby from 'globby'
import packpath from 'packpath'
import path, { basename } from 'path'
import prettier from 'prettier'
import { ErrorHandler, log } from '../../lib'

const prettierrc = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../.prettierrc'), 'utf-8')
)

const runThemeFactory = async () => {
  log.start('> PrePublish: Starting the themes factory ...')

  const processToNamesIgnoreList = [
    '!**/__tests__/',
    '!**/web-components/',
    '!**/style/',
    '!**/helper-classes/',
    '!**/*_not_in_use*'
  ]

  // make themes
  await runFactory({
    scssOutputFile: path.resolve(__dirname, '../../../src/style/themes'),
    customContent: `@import '../core/dnb-theme.scss';

/**
  ATTENTION: This file is auto generated by using "themeFactory".
  Do not change the content above!
  All the themes get auto generated in here
*/`,
    processToNamesList: [
      path.resolve(
        __dirname,
        '../../../src/{components,patterns}/**/style/themes/*.scss'
      )
    ].concat(processToNamesIgnoreList)
  }).then(() => {
    if (require.main === module) {
      log.succeed(
        '> PrePublish: "themeFactory" Created the themes files with all the components'
      )
    }
  })
}

const autoAdvice =
  '/**\n * ATTENTION: This file is auto generated by using "themeFactory".\n * You CAN change the content on the very top!\n *\n */\n'

const runFactory = async ({
  scssOutputFile,
  processToNamesList,
  customContent = ''
}) => {
  try {
    processToNamesList = await globby(processToNamesList, {
      // onlyDirectories
    })
    processToNamesList.sort()
  } catch (e) {
    console.log('Error', e)
  }

  processToNamesList = processToNamesList.map(source => ({
    source,
    name: basename(source)
  }))

  const groups = {}

  processToNamesList.forEach(object => {
    const name = /(.*)-theme-(.*)\.scss/g.exec(object.name)[2]
    groups[name] = groups[name] || []
    groups[name].push(object)
  })

  const themes = []
  Object.entries(groups).forEach(group => {
    const name = group[0]
    const files = group[1]
    const theme = files
      .reduce((acc, { source }) => {
        const path = packpath.self()
        acc.push(
          `\n@import '${source.replace(
            new RegExp(`${path}/src/`, 'g'),
            '../../'
          )}';`
        )
        return acc
      }, [])
      .join('')
    themes.push({
      name,
      theme
    })
  })

  try {
    themes.forEach(async ({ name, theme }) => {
      const file = `${scssOutputFile}/dnb-theme-${name}.scss`
      let fileContent = ''
      if (fs.existsSync(file)) {
        fileContent = await fs.readFile(file, 'utf-8')
        fileContent = fileContent.replace(
          /(\/\*\*[^]*not change the content above![^]*\*\/)([^]*)/g,
          `$1\n${theme}\n`
        )
      } else {
        fileContent = `${autoAdvice}\n${customContent}\n${theme}\n`
      }
      await fs.writeFile(
        file,
        prettier.format(fileContent, {
          ...prettierrc,
          filepath: file
        })
      )
    })
  } catch (e) {
    log.fail(`There was an error on creating ${scssOutputFile}!`)
    new ErrorHandler(e)
  }
}

if (require.main === module && process.env.NODE_ENV !== 'test') {
  log.start()
  runThemeFactory().then(() => {
    log.succeed()
  })
}

export { runThemeFactory }
