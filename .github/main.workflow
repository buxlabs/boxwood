workflow "New workflow" {
  on = "push"
  resolves = [
    "npm run lint",
    "npm test",
  ]
}

action "npm install" {
  uses = "actions/npm@c555744"
  runs = "npm install"
}

action "npm run lint" {
  uses = "actions/npm@c555744"
  needs = ["npm install"]
  runs = "npm run lint"
}

action "npm test" {
  uses = "actions/npm@c555744"
  needs = ["npm install"]
  runs = "npm test"
}

