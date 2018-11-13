/**
 * Node
 *
 */

import { ConvertAndSaveComponentsStyle } from './tasks/componentsStyleConverter'
// import { FetchImages } from './tasks/imageStore'
import { IconsConverter } from './tasks/iconsConverter'
import { log, ErrorHandler } from '../lib'
import { getFigmaDoc } from './helpers/docHelpers'

log.start('> Figma: Preparing for connecting to the Figma API ...')

export const fetchFigmaStyles = async (args = {}) => {
  try {
    log.start('> Figma: Starting the style conversion.')
    const styles = await ConvertAndSaveComponentsStyle(args, {
      doReplaceVars: true
    })
    log.succeed(
      `> Figma: Style conversion done. (${styles.length} styles)`
    )
  } catch (e) {
    log.fail(e)
    new ErrorHandler(e)
  }
}

export const fetchFigmaIcons = async (args = {}) => {
  try {
    log.start('> Figma: Starting the icons conversion')
    const icons = await IconsConverter(args)
    log.succeed(`> Figma: Icons conversion done (${icons.length} icons)`)
  } catch (e) {
    log.fail(e)
    new ErrorHandler(e)
  }
}

export const fetchFigmaData = async (args = {}) => {
  try {
    let { figmaDoc, doRefetch } = args

    if (!figmaDoc || doRefetch) {
      figmaDoc = await getFigmaDoc({ doRefetch })
      if (figmaDoc.isNew) {
        doRefetch = true
      }
      args = { ...args, figmaDoc, doRefetch }
    }

    await fetchFigmaStyles(args)
    await fetchFigmaIcons(args)
    log.succeed('> Figma: All done')
  } catch (e) {
    log.fail(e)
    new ErrorHandler(e)
  }
}
