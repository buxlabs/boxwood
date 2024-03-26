const { fragment, div, span } = require("../../..")

function description(account) {
  if (account.status === "closed") {
    return "Your account has been closed!"
  }
  if (account.status === "suspended") {
    return "Your account has been temporarily suspended"
  }
  return (
    "Bank balance: " +
    span(
      { class: account.balance >= 0 ? "positive" : "negative" },
      account.balance
    )
  )
}

module.exports = function ({ accounts }) {
  return fragment(accounts.map((account) => div(description(account))))
}
