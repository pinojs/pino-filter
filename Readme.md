# pino-filter
[![npm version](https://img.shields.io/npm/v/pino-filter)](https://www.npmjs.com/package/pino-filter)
[![Build Status](https://img.shields.io/github/actions/workflow/status/pinojs/pino-filter/ci.yml?branch=master)](https://github.com/pinojs/pino-filter/actions)
[![Coverage Status](https://coveralls.io/repos/github/pinojs/pino-filter/badge.svg?branch=master)](https://coveralls.io/github/pinojs/pino-filter?branch=master)

*pino-filter* is a transport for [Pino](https://github.com/pinojs/pino) that
allows filtering of log lines based on logger names, similar to the functionality
of filters in the [debug](https://npmjs.com/debug) module.

Logs that match any filters are written to `stdout`. By default, *pino-filter*
will pass through all received logs at the `info` level or higher. To define
filters, a configuration file must be supplied that provides a mapping of
filters to log levels. For example, you can supply a simple JSON file:

```json
{
  "levels": {
    "*": "info",
    "foo:bar": "debug",
    "baz:*": "trace"
  }
}
```

## Usage

```sh
$ node the-app.js | pino-filter ./config.json
```

## Config

```js
module.exports = {
  levels: {
    '*': 'info', // catch-all filter
    'foo:bar': 'debug',
    'baz:*': 'trace'
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
```

+ `levels`: a mapping of filters (keys) to log levels (level names). Note:
  the wildcard `*` may only be used at the end of a filter, e.g. `foo:*` is valid
  but `foo:*:bar` is not.
+ `values`: a mapping of level names to their numeric value. The default is
  set to the standard Pino levels. If custom levels are defined in the application,
  those level values should be defined here.

Note: the configuration file can be reloaded at runtime by sending the
`SIGHUP` signal to the *pino-filter* process.
