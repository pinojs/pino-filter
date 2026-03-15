#!/usr/bin/env node
'use strict'

const path = require('path')
const fs = require('fs')
const realPath = fs.realpathSync(__dirname)
const script = path.join(realPath, 'index.js')

const { cli } = require(script.toString())
cli()
