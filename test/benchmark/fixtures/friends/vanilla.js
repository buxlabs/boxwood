module.exports = function ({ friends }) {
  let template = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Friends</title></head><body><div class="friends">'
  for (let i = 0, ilen = friends.length; i < ilen; i++) {
    const friend = friends[i]
    template += '<div class="friend">'
    template += '<ul>'
    template += '<li>Name: ' + friend.name + '</li>'
    template += '<li>Balance: ' + friend.balance + '</li>'
    template += '<li>Age: ' + friend.age + '</li>'
    template += '<li>Address: ' + friend.address + '</li>'
    template += '<li>Image: <img src="' + friend.picture + '"></li>'
    template += '<li>Company: ' + friend.company + '</li>'
    template += '<li>Email: <a href="mailto:' + friend.email + '">' + friend.email + '</a></li>'
    template += '<li>About: ' + friend.about + '</li>'
    if (friend.tags.length) {
      template += '<li>Tags: <ul>'
      for (let j = 0, jlen = friend.tags.length; j < jlen; j++) {
        const tag = friend.tags[j]
        template += '<li>' + tag + '</li>'
      }
      template += '</ul></li>'
    }
    if (friend.friends.length) {
      template += '<li>Friends: <ul>'
      for (let j = 0, jlen = friend.friends.length; j < jlen; j++) {
        const person = friend.friends[j]
        template += '<li>' + person.name + ' (' + person.id + ')</li>'
      }
      template += '</ul></li>'
    }
    template += '</ul>'
    template += '</div>'
  }
  template += '</div></body></html>'
  return template
}
