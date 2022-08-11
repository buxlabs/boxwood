import { doctype, head, body, meta, title, div, ul, li, a } from 'boxwood'

export default function ({ friends }) {
  return [
    doctype(),
    head([
      meta({ charset: 'UTF-8' }),
      title('Friends'),
    ]),
    body([
      div({ class: 'friends' }, friends.map(friend => {
        return div({ class: 'friend' }, [
          ul([
            li(`Name: ${friend.name}`),
            li(`Balance: ${friend.balance}`),
            li(`Age: ${friend.age}`),
            li(`Address: ${friend.address}`),
            li([
              `Image: `,
              img({ src: friend.image })
            ]),
            li(`Company: ${friend.company}`),
            li([
              `Email: `,
              a({ href: `mailto:${friend.email}` }, friend.email)
            ]),
            li(`About: ${friend.about}`),
            friend.tags.length && li([
              `Tags: `,
              ul(friend.tags.map(tag => li(tag)))
            ]),
            friend.friends.length && li([
              `Friends: `,
              ul(friend.friends.map(friend => li(`${friend.name} (${friend.id})`)))
            ])
          ]).filter(Boolean)
        ])
      }))
    ])
  ]
}
