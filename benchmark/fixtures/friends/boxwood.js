const {
  Doctype,
  Html,
  Head,
  Body,
  Meta,
  IMg,
  Title,
  Div,
  Ul,
  Li,
  A,
} = require("../../..")

module.exports = function ({ friends }) {
  return [
    Doctype(),
    Html({ lang: "en" }, [
      Head([Meta({ charset: "UTF-8" }), Title("Friends")]),
      Body([
        Div(
          { class: "friends" },
          friends.map((friend) => {
            return Div({ class: "friend" }, [
              Ul([
                Li(`Name: ${friend.name}`),
                Li(`Balance: ${friend.balance}`),
                Li(`Age: ${friend.age}`),
                Li(`Address: ${friend.address}`),
                Li(["Image: ", IMg({ src: friend.picture })]),
                Li(`Company: ${friend.company}`),
                Li([
                  "Email: ",
                  A({ href: `mailto:${friend.email}` }, friend.email),
                ]),
                Li(`About: ${friend.about}`),
                friend.tags.length &&
                  Li(["Tags: ", Ul(friend.tags.map((tag) => Li(tag)))]),
                friend.friends.length &&
                  Li([
                    "Friends: ",
                    Ul(
                      friend.friends.map((friend) =>
                        Li(`${friend.name} (${friend.id})`)
                      )
                    ),
                  ]),
              ]),
            ])
          })
        ),
      ]),
    ]),
  ]
}
