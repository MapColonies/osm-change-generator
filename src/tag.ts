import { GetChangeOptions, Tags } from '.';

interface ToStringable {
  toString: () => string;
}

export type GlobalTagConditionFn = <K extends string, V extends string>(key: K, value: V) => boolean;

export const tagLengthValidator = (key: string, value: string, maxKeyLength?: number, maxValueLength?: number): boolean => {
  const isKeyValid = maxKeyLength === undefined || key.length <= maxKeyLength;

  const isValueValid = maxValueLength === undefined || value.length <= maxValueLength;

  return isKeyValid && isValueValid;
};

export const tagLengthValidatorFactory = (options?: Partial<GetChangeOptions>): GlobalTagConditionFn => {
  const { maxTagKeyLength, maxTagValueLength } = options ?? {};

  return (key, value) => tagLengthValidator(key, value, maxTagKeyLength, maxTagValueLength);
};

export const addTagsConditionally = (
  current: Tags,
  pairs: { condition: boolean; tags: Record<string, ToStringable | undefined> }[],
  globalCondition?: GlobalTagConditionFn
): Tags => {
  const next: Tags = {};

  // iterate over each condition-tags pair and attribute the next tags only for true conditions
  for (const { condition, tags } of pairs) {
    if (!condition) {
      continue;
    }

    for (const key in tags) {
      if (Object.prototype.hasOwnProperty.call(tags, key) && tags[key] !== undefined) {
        next[key] = tags[key].toString();
      }
    }
  }

  // iterate over the current tags and attribute the next tags with a tag only if it passes the global condition
  if (current !== undefined) {
    for (const [key, value] of Object.entries(current)) {
      if (globalCondition !== undefined && !globalCondition(key, value)) {
        continue;
      }
      next[key] = value;
    }
  }

  return Object.keys(next).length !== 0 ? next : undefined;
};

export const removeTags = (current: Tags, tags: string[]): void => {
  if (current === undefined) {
    return;
  }

  for (const tag of tags) {
    delete current[tag];
  }
};
