/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { hasRef } from './has_ref';
import { traverseObject } from './traverse_object';

/**
 * Traverse the OpenAPI document recursively and find all references
 *
 * @param obj Any object
 * @returns A list of external references
 */
export function findRefs(obj: unknown): string[] {
  const refs: string[] = [];

  traverseObject(obj, (element) => {
    if (hasRef(element)) {
      refs.push(element.$ref);
    }
  });

  return refs;
}
