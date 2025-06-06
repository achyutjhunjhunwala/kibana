/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import * as t from 'io-ts';
import { jsonRt } from '.';
import { isRight, Either, isLeft, fold } from 'fp-ts/Either';
import { Right } from 'fp-ts/Either';
import { pipe } from 'fp-ts/pipeable';
import { identity } from 'fp-ts/function';

function getValueOrThrow<TEither extends Either<any, any>>(either: TEither): Right<TEither> {
  const value = pipe(
    either,
    fold(() => {
      throw new Error('cannot get right value of left');
    }, identity)
  );

  return value as Right<TEither>;
}

describe('jsonRt', () => {
  it('validates json', () => {
    expect(isRight(jsonRt.decode('{}'))).toBe(true);
    expect(isRight(jsonRt.decode('[]'))).toBe(true);
    expect(isRight(jsonRt.decode('true'))).toBe(true);
    expect(isLeft(jsonRt.decode({}))).toBe(true);
    expect(isLeft(jsonRt.decode('foo'))).toBe(true);
  });

  it('returns parsed json when decoding', () => {
    expect(getValueOrThrow(jsonRt.decode('{}'))).toEqual({});
    expect(getValueOrThrow(jsonRt.decode('[]'))).toEqual([]);
    expect(getValueOrThrow(jsonRt.decode('true'))).toEqual(true);
  });

  it('is pipable', () => {
    const piped = jsonRt.pipe(t.type({ foo: t.string }));

    const validInput = { foo: 'bar' };
    const invalidInput = { foo: null };

    const valid = piped.decode(JSON.stringify(validInput));
    const invalid = piped.decode(JSON.stringify(invalidInput));

    expect(isRight(valid)).toBe(true);
    expect(getValueOrThrow(valid)).toEqual(validInput);

    expect(isLeft(invalid)).toBe(true);
  });

  it('returns strings when encoding', () => {
    expect(jsonRt.encode({})).toBe('{}');
  });
});
