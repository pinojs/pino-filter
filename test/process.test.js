'use strict'

const test = require('tap').test
const spawn = require('child_process').spawn
const path = require('path')
const pinoFilterPath = path.join(__dirname, '..', 'index.js')

test('process handles non-json input', (t) => {
  t.plan(1)
  const obj = { name: 'foo:bar', level: 30, msg: 'foo bar' }
  const pinoFilter = spawn(process.argv[0], [pinoFilterPath])

  pinoFilter.stdout.on('data', (data) => {
    t.is(data.toString(), JSON.stringify(obj))
  })

  pinoFilter.on('close', (code) => {
    if (code && code !== 0) t.fail('pino-filter exited with error')
  })

  pinoFilter.stdin.write('not a valid log line\n')
  pinoFilter.stdin.end(JSON.stringify(obj) + '\n')
})

test('logs all info lines when no config given', (t) => {
  t.plan(1)
  const obj = { name: 'foo:bar', level: 30, msg: 'foo bar' }
  const pinoFilter = spawn(process.argv[0], [pinoFilterPath])

  pinoFilter.stdout.on('data', (data) => {
    t.is(data.toString(), JSON.stringify(obj))
  })

  pinoFilter.on('close', (code) => {
    if (code && code !== 0) t.fail('pino-filter exited with error')
  })

  pinoFilter.stdin.end(JSON.stringify(obj) + '\n')
})
