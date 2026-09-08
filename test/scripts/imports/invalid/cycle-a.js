import { b } from "./cycle-b.js"
export function a() {
  return b()
}
