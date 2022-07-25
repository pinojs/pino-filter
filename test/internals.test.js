'use strict'

const test = require('tap').test
const writeStream = require('flush-write-stream')
const internals = require('../').internals

test('filter returns name if no wildcard present', (t) => {
  t.plan(1)
  const filter = internals.getFilter('foo:bar')
  t.is(filter, 'foo:bar')
})

test('filter returns wildcard if name is only wildcard', (t) => {
  t.plan(1)
  const filter = internals.getFilter('*')
  t.is(filter, '*')
})

test('filter returns startsWith filter', (t) => {
  t.plan(1)
  const filter = internals.getFilter('foo:bar:*')
  t.is(filter, '~foo:bar:')
})

test('transport writes all logs for * filter', (t) => {
  t.plan(1)
  const ints = Object.create(internals)
  const obj = { name: 'foo:bar', msg: 'foo bar', level: 30 }
  const stream = writeStream((data, enc, cb) => {
    t.is(data.toString(), JSON.stringify(obj))
    cb()
  })

  ints.stream = stream
  ints.filters = '*'
  ints.levels = { '*': 'info' }
  ints.values = { info: 30 }
  ints.transport(obj, 'ascii', () => {})
})

test('transport writes logs for `foo:*` filter only', (t) => {
  t.plan(1)
  const ints = Object.create(internals)
  const obj = { name: 'foo:bar', msg: 'foo bar', level: 30 }

  ints.stream = writeStream((data, enc, cb) => {
    t.is(data.toString(), JSON.stringify(obj))
    cb()
  })
  ints.filters = 'foo:*'
  ints.levels = { 'foo:bar': 'info' }
  ints.values = { info: 30 }
  ints.transport(obj, 'ascii', () => {})

  const obj2 = { name: 'bar:foo', msg: 'bar foo', level: 30 }
  ints.stream = writeStream((data, enc, cb) => {
    t.fail('log should not be written')
    cb()
  })
  ints.transport(obj2, 'ascii', () => {})
})

test('transport writes all logs for `foo:bar` filter at `info` level', (t) => {
  t.plan(1)
  const ints = Object.create(internals)
  const obj = { name: 'foo:bar', msg: 'foo bar', level: 30 }
  const stream = writeStream((data, enc, cb) => {
    t.is(data.toString(), JSON.stringify(obj))
    cb()
  })

  ints.stream = stream
  ints.filters = 'foo:bar'
  ints.levels = { 'foo:bar': 'info' }
  ints.values = { info: 30 }
  ints.transport(obj, 'ascii', () => {})

  const obj2 = { name: 'foo:bar', msg: 'bar foo', level: 10 }
  ints.stream = writeStream((data, enc, cb) => {
    t.fail('log should not be written')
    cb()
  })
  ints.transport(obj2, 'ascii', () => {})
})

test('transport writes logs for `foo:bar` filter only', (t) => {
  t.plan(1)
  const ints = Object.create(internals)
  const obj = { name: 'foo:bar', msg: 'foo bar', level: 30 }

  ints.stream = writeStream((data, enc, cb) => {
    t.is(data.toString(), JSON.stringify(obj))
    cb()
  })
  ints.filters = 'foo:bar'
  ints.levels = { 'foo:bar': 'info' }
  ints.values = { info: 30 }
  ints.transport(obj, 'ascii', () => {})

  const obj2 = { name: 'foo:bar:baz', msg: 'foo bar baz', level: 30 }
  ints.stream = writeStream((data, enc, cb) => {
    t.fail('log should not be written')
    cb()
  })
  ints.transport(obj2, 'ascii', () => {})
})
