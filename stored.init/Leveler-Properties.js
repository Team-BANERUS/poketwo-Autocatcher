import { ValidateLvl, Leveler, Ranker } from './banerus/lvler'

export function owAnyx<T>(
  ...predicators: Predicator<Predicate<any>>[]
): Predicator<Predicate<T>> {
  const messagesSymbol = Symbol()
  const validator: Validator<any> = {
    validate(input, context): input is any {
      const messages = []
      for (const predicator of predicators) {
        const message = reportValidation(input, predicator)
        if (message == null) return true
        messages.push(message)
      }
      context[messagesSymbol] = messages
      return false
    },
    report(_input, context) {
      const messages: string[] = context[messagesSymbol]
      return [
        `Expected value to match any of following conditions`,
        ...messages.map(message => `- ${message.replace(/\n/g, '\n  ')}`)
      ].join('\n')
    }
  }
  return {
    predicate: {
      validators: [validator]
    }
  }
}

export function owAny<T1>(
  predicator1: Predicator<Predicate<T1>>
): Predicator<Predicate<T1>>
export function owAny<T1, T2>(
  predicator1: Predicator<Predicate<T1>>,
  predicator2: Predicator<Predicate<T2>>
): Predicator<Predicate<T1 | T2>>
export function owAny<T1, T2, T3>(
  predicator1: Predicator<Predicate<T1>>,
  predicator2: Predicator<Predicate<T2>>,
  predicator3: Predicator<Predicate<T3>>
): Predicator<Predicate<T1 | T2 | T3>>
export function owAny<T1, T2, T3, T4>(
  predicator1: Predicator<Predicate<T1>>,
  predicator2: Predicator<Predicate<T2>>,
  predicator3: Predicator<Predicate<T3>>,
  predicator4: Predicator<Predicate<T4>>
): Predicator<Predicate<T1 | T2 | T3 | T4>>
export function owAny<T1, T2, T3, T4, T5>(
  predicator1: Predicator<Predicate<T1>>,
  predicator2: Predicator<Predicate<T2>>,
  predicator3: Predicator<Predicate<T3>>,
  predicator4: Predicator<Predicate<T4>>,
  predicator5: Predicator<Predicate<T5>>
): Predicator<Predicate<T1 | T2 | T3 | T4 | T5>>
export function owAny<T1, T2, T3, T4, T5, T6>(
  predicator1: Predicator<Predicate<T1>>,
  predicator2: Predicator<Predicate<T2>>,
  predicator3: Predicator<Predicate<T3>>,
  predicator4: Predicator<Predicate<T4>>,
  predicator5: Predicator<Predicate<T5>>,
  predicator6: Predicator<Predicate<T6>>
): Predicator<Predicate<T1 | T2 | T3 | T4 | T5 | T6>>
export function owAny<T1, T2, T3, T4, T5, T6, T7>(
  predicator1: Predicator<Predicate<T1>>,
  predicator2: Predicator<Predicate<T2>>,
  predicator3: Predicator<Predicate<T3>>,
  predicator4: Predicator<Predicate<T4>>,
  predicator5: Predicator<Predicate<T5>>,
  predicator6: Predicator<Predicate<T6>>,
  predicator7: Predicator<Predicate<T7>>
): Predicator<Predicate<T1 | T2 | T3 | T4 | T5 | T6 | T7>>
export function owAny<T1, T2, T3, T4, T5, T6, T7, T8>(
  predicator1: Predicator<Predicate<T1>>,
  predicator2: Predicator<Predicate<T2>>,
  predicator3: Predicator<Predicate<T3>>,
  predicator4: Predicator<Predicate<T4>>,
  predicator5: Predicator<Predicate<T5>>,
  predicator6: Predicator<Predicate<T6>>,
  predicator7: Predicator<Predicate<T7>>,
  predicator8: Predicator<Predicate<T8>>
): Predicator<Predicate<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8>>
export function owAny<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  predicator1: Predicator<Predicate<T1>>,
  predicator2: Predicator<Predicate<T2>>,
  predicator3: Predicator<Predicate<T3>>,
  predicator4: Predicator<Predicate<T4>>,
  predicator5: Predicator<Predicate<T5>>,
  predicator6: Predicator<Predicate<T6>>,
  predicator7: Predicator<Predicate<T7>>,
  predicator8: Predicator<Predicate<T8>>,
  predicator9: Predicator<Predicate<T9>>
): Predicator<Predicate<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>>
export function owAny<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  predicator1: Predicator<Predicate<T1>>,
  predicator2: Predicator<Predicate<T2>>,
  predicator3: Predicator<Predicate<T3>>,
  predicator4: Predicator<Predicate<T4>>,
  predicator5: Predicator<Predicate<T5>>,
  predicator6: Predicator<Predicate<T6>>,
  predicator7: Predicator<Predicate<T7>>,
  predicator8: Predicator<Predicate<T8>>,
  predicator9: Predicator<Predicate<T9>>,
  predicator10: Predicator<Predicate<T10>>
): Predicator<Predicate<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10>>
export function owAny(
  ...predicators: Predicator<Predicate<any>>[]
): Predicator<Predicate<any>> {
  return owAnyx(...predicators)
}
// Multiple pokemon lvl capacity and then connect leveler.js with this export.
