workflow "New workflow" {
  on = "push"
  resolves = ["lint"]
}

action "lint" {
  uses = "actions/npm@c555744"
  runs = "npm run lint"
}
