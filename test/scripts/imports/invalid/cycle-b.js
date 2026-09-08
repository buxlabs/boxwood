import { a } from "./cycle-a.js"
export function b() {
  return a()
}
