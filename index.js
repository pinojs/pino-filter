'use strict'

const split = require('split2')
const pump = require('pump')
const through = require('through2')
const assign = require('deep-assign')
const jsonParser = require('fast-json-parse')

const defaults = {
  levels: {
    '*': 'info'
  },
  values: {
    fatal: 60,
    error: 50,
    warn: 40,
    info: 30,
    debug: 20,
    trace: 10
  }
}

let config = defaults

const internals = {
  getFilter (name) {
    if (!name) return '*'
    if (name.includes('*') === false) return name
    if (name === '*') return name
    return '~' + name.split('*')[0]
  },

  transport (chunk, enc, cb) {
    if (!chunk.name) {
      this.stream.write(JSON.stringify(chunk))
      return cb()
    }

    const logName = chunk.name
    const logLevelName = this.levels[logName] || 'info'
    const logLevelValue = this.values[logLevelName]
    const filter = this.getFilter(chunk.name)
    if (filter === '*' && chunk.level >= logLevelValue) {
      this.stream.write(JSON.stringify(chunk))
      return cb()
    }

    for (var i = 0; i < this.filters.length; i += 1) {
      const filter = this.filters[i]
      if (filter === '*' && chunk.level >= logLevelValue) {
        this.stream.write(JSON.stringify(chunk))
        break
      }

      if (filter[0] === '~' && logName.startsWith(filter.substr(1))) {
        if (chunk.level >= logLevelValue) this.stream.write(JSON.stringify(chunk))
        break
      }

      if (filter === logName && chunk.level >= logLevelValue) {
        this.stream.write(JSON.stringify(chunk))
        break
      }
    }

    cb()
  },

  stream: process.stdout
}

Object.defineProperty(internals, 'filters', {
  set (input) {
    if (Array.isArray(input) === false) {
      this._filters = [this.getFilter(input)]
      return
    }
    this._filters = []
    input.forEach((f) => {
      const newF = this.getFilter(f)
      this._filters.push(newF)
    })
  },

  get () { return this._filters }
})

Object.defineProperty(internals, 'levels', {
  set (input) {
    this._levels = input
  },

  get () { return this._levels || config.levels }
})

Object.defineProperty(internals, 'values', {
  set (input) {
    this._values = input
  },

  get () { return this._values || config.values }
})

function loadConfig () {
  let result = defaults
  try {
    const userConfig = require(process.argv[2])
    result = assign({}, defaults, userConfig)
  } catch (e) {
    console.error('could not load specified config: %s', e.message)
    process.exit(1)
  }
  return result
}

function parser (input) {
  const result = jsonParser(input)
  if (result.err) return
  return result.value
}

// We are being run as a "binary"
if (require.main === module) {
  if (process.argv.length === 3) {
    config = loadConfig()
  }
  internals.filters = Object.keys(config.levels)
  internals.levels = config.levels
  internals.values = config.values

  process.on('SIGHUP', () => {
    config = loadConfig()
    internals.filters = Object.keys(config.levels)
    internals.levels = config.levels
    internals.values = config.values
  })

  const myTransport = through.obj(internals.transport.bind(internals))
  pump(process.stdin, split(parser), myTransport)
}

module.exports.internals = internals
