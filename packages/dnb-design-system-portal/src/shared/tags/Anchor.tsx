/**
 * Anchor Tag
 *
 */

import React, { MouseEvent } from 'react'
import { Link } from '@dnb/eufemia/src/elements'
import { getOffsetTop } from '@dnb/eufemia/src/shared/helpers'

const Anchor = ({ children, href, ...rest }) => {
  if (/^http/.test(href) || href[0] === '!') {
    rest.target = '_blank'
    rest.rel = 'noreferrer'
    if (href[0] === '!') {
      href = href.substr(1)
    }
  }

  return (
    <Link lang="en-GB" href={href} {...rest} onClick={clickHandler}>
      {children}
    </Link>
  )

  function clickHandler(e: MouseEvent) {
    if (
      typeof navigator !== 'undefined' &&
      /**
       * What happens here?
       * When `scroll-behavior: smooth;` in CSS is set,
       * Chromium wants the user to click two times in order to actually scroll to the anchor hash.
       * The first click, sets the hash, the second one, srollts to it.
       * We want Chromium browsers to scorll to the element on the first click.
       */
      /chrome/i.test(navigator?.userAgent)
    ) {
      const id = e.currentTarget.getAttribute('href').slice(1)
      const anchorElem = document.getElementById(id)
      if (anchorElem instanceof HTMLElement) {
        e.preventDefault()

        const top = getOffsetTop(anchorElem)
        window.scroll({ top })
      }
    }
  }
}

export default Anchor