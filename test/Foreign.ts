import * as Context from "@effect/data/Context"
import * as Either from "@effect/data/Either"
import * as Option from "@effect/data/Option"
import * as Cause from "@effect/io/Cause"
import * as STM from "@effect/stm/STM"
import * as it from "@effect/stm/test/utils/extend"
import { assert, describe } from "vitest"

describe.concurrent("Foreign", () => {
  it.effect("Tag", () =>
    STM.gen(function*($) {
      const tag = Context.Tag<number>()
      const result = yield* $(tag, STM.provideService(tag, 10))
      assert.deepEqual(result, 10)
    }))
  it.effect("Either", () =>
    STM.gen(function*($) {
      const a = yield* $(Either.right(10))
      const b = yield* $(STM.either(Either.left(10)))
      assert.deepEqual(a, 10)
      assert.deepEqual(b, Either.left(10))
    }))
  it.effect("Option", () =>
    STM.gen(function*($) {
      const a = yield* $(Option.some(10))
      const b = yield* $(STM.either(Option.none()))
      assert.deepEqual(a, 10)
      assert.deepEqual(b, Either.left(Cause.NoSuchElementException()))
    }))
})
