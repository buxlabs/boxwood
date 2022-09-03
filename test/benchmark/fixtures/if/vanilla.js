function description (account) {
  if (account.status === 'closed') { return 'Your account has been closed!' }
  if (account.status === 'suspended') { return 'Your account has been temporarily suspended' }
  return 'Bank balance: ' + '<span class="' + account.balance >= 0 ? 'positive' : 'negative' + '">' + account.balance + '</span>'
}

module.exports = function ({ accounts }) {
  let template = ''
  for (let i = 0, ilen = accounts.length; i < ilen; i++) {
    const account = accounts[i]
    template += '<div>' + description(account) + '</div>'
  }
  return template
}
