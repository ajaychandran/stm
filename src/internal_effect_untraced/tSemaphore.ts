import * as Cause from "@effect/io/Cause"
import * as Debug from "@effect/io/Debug"
import * as Effect from "@effect/io/Effect"
import type * as Scope from "@effect/io/Scope"
import * as core from "@effect/stm/internal_effect_untraced/core"
import * as tRef from "@effect/stm/internal_effect_untraced/tRef"
import * as STM from "@effect/stm/STM"
import type * as TRef from "@effect/stm/TRef"
import type * as TSemaphore from "@effect/stm/TSemaphore"
import { pipe } from "@fp-ts/core/Function"

/** @internal */
const TSemaphoreSymbolKey = "@effect/stm/TSemaphore"

/** @internal */
export const TSemaphoreTypeId: TSemaphore.TSemaphoreTypeId = Symbol.for(
  TSemaphoreSymbolKey
) as TSemaphore.TSemaphoreTypeId

/** @internal */
class TSemaphoreImpl implements TSemaphore.TSemaphore {
  readonly [TSemaphoreTypeId]: TSemaphore.TSemaphoreTypeId = TSemaphoreTypeId
  constructor(readonly permits: TRef.TRef<number>) {}
}

/**
 * @internal
 */
export const make = Debug.methodWithTrace((trace) =>
  (permits: number): STM.STM<never, never, TSemaphore.TSemaphore> =>
    STM.map(tRef.make(permits), (permits) => new TSemaphoreImpl(permits)).traced(trace)
)

/**
 * @internal
 */
export const acquire = Debug.methodWithTrace((trace) =>
  (self: TSemaphore.TSemaphore): STM.STM<never, never, void> => pipe(self, acquireN(1)).traced(trace)
)

/**
 * @internal
 */
export const acquireN = Debug.dualWithTrace<
  (self: TSemaphore.TSemaphore, n: number) => STM.STM<never, never, void>,
  (n: number) => (self: TSemaphore.TSemaphore) => STM.STM<never, never, void>
>(2, (trace) =>
  (self, n) =>
    core.withSTMRuntime((driver) => {
      if (n < 0) {
        throw Cause.IllegalArgumentException(`Unexpected negative value ${n} passed to Semaphore.acquireN`)
      }
      const value = pipe(self.permits, tRef.unsafeGet(driver.journal))
      if (value < n) {
        return STM.retry()
      } else {
        return STM.succeed(pipe(self.permits, tRef.unsafeSet(value - n, driver.journal)))
      }
    }).traced(trace))

/**
 * @internal
 */
export const available = Debug.methodWithTrace((trace) =>
  (self: TSemaphore.TSemaphore) => tRef.get(self.permits).traced(trace)
)

/**
 * @internal
 */
export const release = Debug.methodWithTrace((trace) =>
  (self: TSemaphore.TSemaphore): STM.STM<never, never, void> => pipe(self, releaseN(1)).traced(trace)
)

/**
 * @internal
 */
export const releaseN = Debug.dualWithTrace<
  (self: TSemaphore.TSemaphore, n: number) => STM.STM<never, never, void>,
  (n: number) => (self: TSemaphore.TSemaphore) => STM.STM<never, never, void>
>(2, (trace) =>
  (self, n) =>
    core.withSTMRuntime((driver) => {
      if (n < 0) {
        throw Cause.IllegalArgumentException(`Unexpected negative value ${n} passed to Semaphore.releaseN`)
      }
      const current = pipe(self.permits, tRef.unsafeGet(driver.journal))
      return STM.succeed(pipe(self.permits, tRef.unsafeSet(current + n, driver.journal)))
    }).traced(trace))

/**
 * @internal
 */
export const withPermit = Debug.dualWithTrace<
  <R, E, A>(self: Effect.Effect<R, E, A>, semaphore: TSemaphore.TSemaphore) => Effect.Effect<R, E, A>,
  (semaphore: TSemaphore.TSemaphore) => <R, E, A>(self: Effect.Effect<R, E, A>) => Effect.Effect<R, E, A>
>(2, (trace) => (self, semaphore) => pipe(self, withPermits(semaphore, 1)).traced(trace))

/**
 * @internal
 */
export const withPermits = Debug.dualWithTrace<
  <R, E, A>(
    self: Effect.Effect<R, E, A>,
    semaphore: TSemaphore.TSemaphore,
    permits: number
  ) => Effect.Effect<R, E, A>,
  (
    semaphore: TSemaphore.TSemaphore,
    permits: number
  ) => <R, E, A>(self: Effect.Effect<R, E, A>) => Effect.Effect<R, E, A>
>(3, (trace) =>
  (self, semaphore, permits) =>
    Effect.uninterruptibleMask((restore) =>
      pipe(
        restore(core.commit(acquireN(permits)(semaphore))),
        Effect.zipRight(
          pipe(
            restore(self),
            Effect.ensuring(core.commit(releaseN(permits)(semaphore)))
          )
        )
      )
    ).traced(trace))

/**
 * @internal
 */
export const withPermitScoped = Debug.methodWithTrace((trace) =>
  (self: TSemaphore.TSemaphore): Effect.Effect<Scope.Scope, never, void> =>
    pipe(self, withPermitsScoped(1)).traced(trace)
)

/**
 * @internal
 */
export const withPermitsScoped = Debug.dualWithTrace<
  (self: TSemaphore.TSemaphore, permits: number) => Effect.Effect<Scope.Scope, never, void>,
  (permits: number) => (self: TSemaphore.TSemaphore) => Effect.Effect<Scope.Scope, never, void>
>(2, (trace) =>
  (self, permits) =>
    Effect.acquireReleaseInterruptible(
      pipe(self, acquireN(permits), core.commit),
      () => pipe(self, releaseN(permits), core.commit)
    ).traced(trace))

/** @internal */
export const unsafeMakeSemaphore = (permits: number): TSemaphore.TSemaphore => {
  return new TSemaphoreImpl(new tRef.TRefImpl(permits))
}