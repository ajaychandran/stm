/**
 * @since 1.0.0
 */
import type * as Context from "@effect/data/Context"
import type * as Random from "@effect/data/DeterministicRandom"
import type * as Layer from "@effect/io/Layer"
import * as internal from "@effect/stm/internal/tRandom"
import type * as STM from "@effect/stm/STM"
import type * as TRef from "@effect/stm/TRef"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TRandomTypeId: unique symbol = internal.TRandomTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type TRandomTypeId = typeof TRandomTypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface TRandom {
  readonly [TRandomTypeId]: TRandomTypeId
  /**
   * Returns the next numeric value from the pseudo-random number generator.
   */
  readonly next: STM.STM<never, never, number>
  /**
   * Returns the next boolean value from the pseudo-random number generator.
   */
  readonly nextBoolean: STM.STM<never, never, boolean>
  /**
   * Returns the next integer value from the pseudo-random number generator.
   */
  readonly nextInt: STM.STM<never, never, number>
  /**
   * Returns the next numeric value in the specified range from the
   * pseudo-random number generator.
   */
  nextRange(min: number, max: number): STM.STM<never, never, number>
  /**
   * Returns the next integer value in the specified range from the
   * pseudo-random number generator.
   */
  nextIntBetween(min: number, max: number): STM.STM<never, never, number>
  /**
   * Uses the pseudo-random number generator to shuffle the specified iterable.
   */
  shuffle<A>(elements: Iterable<A>): STM.STM<never, never, Array<A>>
}
/**
 * @internal
 * @since 1.0.0
 */
export interface TRandom {
  /** @internal */
  readonly state: TRef.TRef<Random.PCGRandomState>
}

/**
 * The service tag used to access `TRandom` in the environment of an effect.
 *
 * @since 1.0.0
 * @category context
 */
export const Tag: Context.Tag<TRandom, TRandom> = internal.Tag

/**
 * The "live" `TRandom` service wrapped into a `Layer`.
 *
 * @since 1.0.0
 * @category context
 */
export const live: Layer.Layer<never, never, TRandom> = internal.live

/**
 * Returns the next number from the pseudo-random number generator.
 *
 * @since 1.0.0
 * @category random
 */
export const next: STM.STM<TRandom, never, number> = internal.next

/**
 * Returns the next boolean value from the pseudo-random number generator.
 *
 * @since 1.0.0
 * @category random
 */
export const nextBoolean: STM.STM<TRandom, never, boolean> = internal.nextBoolean

/**
 * Returns the next integer from the pseudo-random number generator.
 *
 * @since 1.0.0
 * @category random
 */
export const nextInt: STM.STM<TRandom, never, number> = internal.nextInt

/**
 * Returns the next integer in the specified range from the pseudo-random number
 * generator.
 *
 * @since 1.0.0
 * @category random
 */
export const nextIntBetween: (low: number, high: number) => STM.STM<TRandom, never, number> = internal.nextIntBetween

/**
 * Returns the next number in the specified range from the pseudo-random number
 * generator.
 *
 * @since 1.0.0
 * @category random
 */
export const nextRange: (min: number, max: number) => STM.STM<TRandom, never, number> = internal.nextRange

/**
 * Uses the pseudo-random number generator to shuffle the specified iterable.
 *
 * @since 1.0.0
 * @category random
 */
export const shuffle: <A>(elements: Iterable<A>) => STM.STM<TRandom, never, Array<A>> = internal.shuffle
