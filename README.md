![Logo](admin/tibber.png)
# ioBroker.tibber

<!--


#[![NPM version](https://img.shields.io/npm/v/iobroker.template.svg)](https://www.npmjs.com/package/iobroker.template)
#[![Downloads](https://img.shields.io/npm/dm/iobroker.template.svg)](https://www.npmjs.com/package/iobroker.template)
#![Number of Installations (latest)](https://iobroker.live/badges/template-installed.svg)
#![Number of Installations (stable)](https://iobroker.live/badges/template-stable.svg)
#[![Dependency Status](https://img.shields.io/david/Author/iobroker.template.svg)](https://david-dm.org/Author/iobroker.template)

[![NPM](https://nodei.co/npm/iobroker.template.png?downloads=true)](https://nodei.co/npm/iobroker.template/)

**Tests:** ![Test and Release](https://github.com/Author/ioBroker.template/workflows/Test%20and%20Release/badge.svg)
-->

## tibber adapter for ioBroker

This Adapter is meant to allow integration of the services tibber offers via their API to iobroker.

Upon first run the adapter currently is preconfigured with the demo token. To access your personal data, please add your tibber token to the config.

I will start with pulling the price date for the next two days to allow usage as a source for appliances to pick grid friendly times to run.

## Changelog
<!--
    Placeholder for the next version (at the beginning of the line):
    ### **WORK IN PROGRESS**
-->

* (Magnus8513) 0.0.2 first (beta) release
  * added hourly refresh
  * added "current" date to display the current hour data
  * added some initial error handling
  * added prefill with demo token
  
* (Magnus8513) 0.0.1 initial release 


## License
MIT License

Copyright (c) 2021 Author <tibber@mblatt.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
