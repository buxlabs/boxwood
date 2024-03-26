const {
  fragment,
  doctype,
  html,
  head,
  body,
  meta,
  img,
  title,
  div,
  ul,
  li,
  a,
} = require("../../..")

module.exports = function ({ friends }) {
  return fragment([
    doctype(),
    html({ lang: "en" }, [
      head([meta({ charset: "UTF-8" }), title("Friends")]),
      body([
        div(
          { class: "friends" },
          friends.map((friend) => {
            return div({ class: "friend" }, [
              ul([
                li(`Name: ${friend.name}`),
                li(`Balance: ${friend.balance}`),
                li(`Age: ${friend.age}`),
                li(`Address: ${friend.address}`),
                li(["Image: ", img({ src: friend.picture })]),
                li(`Company: ${friend.company}`),
                li([
                  "Email: ",
                  a({ href: `mailto:${friend.email}` }, friend.email),
                ]),
                li(`About: ${friend.about}`),
                friend.tags.length &&
                  li(["Tags: ", ul(friend.tags.map((tag) => li(tag)))]),
                friend.friends.length &&
                  li([
                    "Friends: ",
                    ul(
                      friend.friends.map((friend) =>
                        li(`${friend.name} (${friend.id})`)
                      )
                    ),
                  ]),
              ]),
            ])
          })
        ),
      ]),
    ]),
  ])
}
