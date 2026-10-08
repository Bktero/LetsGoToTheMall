/**
 * Tells whether a set of optional changes contains at least one value.
 * A property that is absent and a property set to `undefined` both mean "no change".
 */
export function hasChanges(changes: object): boolean {
  return Object.values(changes).some((value) => value !== undefined);
}
