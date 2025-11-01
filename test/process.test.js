'use strict'

const test = require('node:test')
const path = require('node:path')
const { spawn } = require('node:child_process')
const pinoFilterPath = path.join(__dirname, '..', 'index.js')

test('process handles non-json input', (t, end) => {
  t.plan(1)
  const obj = { name: 'foo:bar', level: 30, msg: 'foo bar' }
  const pinoFilter = spawn(process.argv[0], [pinoFilterPath])

  pinoFilter.stdout.on('data', (data) => {
    t.assert.equal(data.toString(), JSON.stringify(obj))
  })

  pinoFilter.on('close', (code) => {
    if (code && code !== 0) t.assert.fail('pino-filter exited with error')
    end()
  })

  pinoFilter.stdin.write('not a valid log line\n')
  pinoFilter.stdin.end(JSON.stringify(obj) + '\n')
})

test('logs all info lines when no config given', (t, end) => {
  t.plan(1)
  const obj = { name: 'foo:bar', level: 30, msg: 'foo bar' }
  const pinoFilter = spawn(process.argv[0], [pinoFilterPath])

  pinoFilter.stdout.on('data', (data) => {
    t.assert.equal(data.toString(), JSON.stringify(obj))
  })

  pinoFilter.on('close', (code) => {
    if (code && code !== 0) t.assert.fail('pino-filter exited with error')
    end()
  })

  pinoFilter.stdin.end(JSON.stringify(obj) + '\n')
})
