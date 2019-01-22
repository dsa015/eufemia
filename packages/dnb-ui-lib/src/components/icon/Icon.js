/**
 * Web Icon Component
 *
 */

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { ErrorHandler } from '../../shared/error-helper'
import {
  registerElement,
  validateDOMAttributes,
  processChildren
} from '../../shared/component-helper'

export const DefaultIconSize = 16
export const DefaultIconSizes = {
  default: 16,
  medium: 24
  // large: 32 // currently not in use
}
export const ListDefaultIconSizes = Object.entries(DefaultIconSizes)

export const propTypes = {
  icon: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
    PropTypes.func
  ]),
  modifier: PropTypes.string,
  /**
   * The Icon size can be either a number or a string
   */
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  alt: PropTypes.string,
  area_hidden: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  attributes: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  class: PropTypes.string,
  // React props
  className: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
    PropTypes.func
  ])
}

export const defaultProps = {
  icon: null,
  modifier: null,
  size: null,
  width: null,
  height: null,
  color: null,
  alt: null,
  area_hidden: false,
  attributes: null,
  class: null,
  // React props
  className: null,
  children: null
}

/**
 * The icon component is a span wrapping an inline svg. When using this component in your preferred framework. To load an svg file dynamically, you may need a "svg-loader". Feel free to use whatever tool you want (regarding the setup/tooling), as long as the output is the same markup as shown below.
 */
export default class Icon extends PureComponent {
  static tagName = 'dnb-icon'
  static propTypes = propTypes
  static defaultProps = defaultProps

  static enableWebComponent(
    tag = Icon.tagName,
    inst = Icon,
    props = defaultProps
  ) {
    registerElement(tag, inst, props)
  }

  static getIcon(props) {
    if (props.icon) {
      return props.icon
    }
    return processChildren(props)
  }

  static prerender(props) {
    const icon = Icon.getIcon(props)

    const {
      color,
      modifier,
      size,
      height,
      width,
      class: _className,
      className,
      area_hidden
    } = props

    let { alt } = props
    let sizeAsInt = -1
    let sizeAsString = null

    // get the icon name - we use is for several things
    const name =
      typeof props.icon === 'string'
        ? props.icon
        : props.icon.displayName || props.icon.name

    // if there is no size, check if we can find the actuall size in the name
    if (!size || size === DefaultIconSize) {
      const nameParts = (name || '').split('_')
      if (nameParts.length > 1) {
        const lastPartOfIconName = nameParts.reverse()[0]
        const potentialSize = ListDefaultIconSizes.filter(
          ([key]) => key === lastPartOfIconName
        ).reduce((acc, [key, value]) => {
          return key && value
        }, null)
        if (potentialSize) {
          sizeAsInt = potentialSize
        }
      } else {
        sizeAsInt = DefaultIconSize
      }
    }

    // if size is defined as a string, find the size number
    else if (typeof size === 'string' && !(parseFloat(size) > 0)) {
      sizeAsInt = ListDefaultIconSizes.filter(
        ([key]) => key === size
      ).reduce((acc, [key, value]) => {
        return key && value
      }, null)

      // of if the size is a default size defined as a string
      if (ListDefaultIconSizes.includes(([key]) => key === size)) {
        sizeAsString = size
      }
    }

    // check if the sizeAsInt is a default size
    if (sizeAsInt > 0) {
      const potentialSizeAsString = ListDefaultIconSizes.reduce(
        (acc, [key, value]) => {
          if (key && value === sizeAsInt) {
            return key
          }
          return acc
        },
        null
      )

      if (potentialSizeAsString) {
        sizeAsString = potentialSizeAsString
      }
    }

    // define all the svg parameters
    const svgParams = {}

    if (!sizeAsString && !(sizeAsInt > 0) && parseFloat(size) > -1) {
      svgParams.width = svgParams.height = parseFloat(size)
    }
    if (parseFloat(width) > -1) {
      svgParams.width = parseFloat(width)
    }
    if (parseFloat(height) > -1) {
      svgParams.height = parseFloat(height)
    }

    // and the sizeAsInt is not a default size
    const sizeAsIntIsValidDefault =
      sizeAsInt > 0 &&
      ListDefaultIconSizes.includes(
        ([key, value]) => key && value === sizeAsInt
      )

    // if the size is default, remove the widht/height
    // but if the browser is IE11 - do not remove theese attributes
    if (!isIE11 && sizeAsIntIsValidDefault) {
      svgParams.width = null
      svgParams.height = null
    }
    if (isIE11 && sizeAsInt > 0) {
      svgParams.width = svgParams.height = sizeAsInt
    }

    if (color) {
      svgParams.color = color
    }

    // some wrapper params
    // also used for code markup simulation
    const wrapperParams = validateDOMAttributes(props, {
      role: 'img'
    })
    // get the alt
    wrapperParams['aria-label'] = (alt || name).replace(/_/g, ' ')
    if (area_hidden) {
      // wrapperParams['role'] = 'presentation' // almost the same as aria-hidden
      wrapperParams['aria-hidden'] = area_hidden
    }
    wrapperParams.className = classnames(
      'dnb-icon',
      modifier ? `dnb-icon--${modifier}` : null,
      sizeAsString ? `dnb-icon--${sizeAsString}` : null,
      _className,
      className
    )

    return {
      ...props,
      icon,
      svgParams,
      wrapperParams
    }
  }

  render() {
    const { icon, size, wrapperParams, svgParams } = Icon.prerender(
      this.props
    )

    const Svg = loadSVG(icon, size)

    // make sure we return an empty span if we dont could get the icon
    if (!Svg) return <span />

    return (
      <span {...wrapperParams}>
        <Svg {...svgParams} />
      </span>
    )
  }
}

export const loadSVG = (icon, size = null, listOfIcons = null) => {
  if (typeof icon === 'function') {
    const elem = icon()
    if (React.isValidElement(elem)) {
      return icon
    }
    return elem
  }

  if (React.isValidElement(icon) || Array.isArray(icon)) {
    return () => icon
  }

  // for importing react component
  try {
    icon = iconCase(icon)
    if (
      size &&
      DefaultIconSizes[size] &&
      size !== 'default' &&
      !(parseFloat(size) > 0) &&
      !icon.includes(size)
    ) {
      icon = `${icon}_${size}`
    }
    const mod = (listOfIcons.dnbIcons
      ? listOfIcons.dnbIcons
      : listOfIcons)[icon]
    return mod && mod.default ? mod.default : mod
  } catch (e) {
    new ErrorHandler(`Icon '${icon}' did not exist!`)
    return null
  }
}

// to replace icon names
export const iconCase = name =>
  name
    .replace(/((?!^)[A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^[0-9]/g, '$1')
    .replace(/[^a-z0-9_]/gi, '_')

export const isIE11 =
  typeof window !== 'undefined'
    ? !!window.MSInputMethodContext && !!document.documentMode
    : false
