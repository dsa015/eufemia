import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import ListSummaryFromEdges from '../../../../../shared/parts/ListSummaryFromEdges'

export default function ListLayoutComponents() {
  const {
    allMdx: { edges },
  } = useStaticQuery(graphql`
    {
      allMdx(
        filter: {
          frontmatter: { title: { ne: null }, draft: { ne: true } }
          internal: {
            contentFilePath: {
              glob: "**/uilib/extensions/forms/Layout/**/*"
            }
          }
        }
        sort: [{ frontmatter: { title: ASC } }]
      ) {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              title
              description
            }
          }
        }
      }
    }
  `)

  return <ListSummaryFromEdges edges={edges} />
}