![Logo](admin/tibber.png)
# ioBroker.tibber



https://www.npmjs.com/package/iobroker.tibber

[![NPM version](https://img.shields.io/npm/v/iobroker.tibber.svg)](https://www.npmjs.com/package/iobroker.tibber)
[![Downloads](https://img.shields.io/npm/dm/iobroker.tibber.svg)](https://www.npmjs.com/package/iobroker.tibber)
![Number of Installations (latest)](https://iobroker.live/badges/tibber-installed.svg)
![Number of Installations (stable)](https://iobroker.live/badges/tibber-stable.svg)
[![Dependency Status](https://img.shields.io/david/Author/iobroker.tibber.svg)](https://david-dm.org/Author/iobroker.tibber)

[![NPM](https://nodei.co/npm/iobroker.tibber.png?downloads=true)](https://nodei.co/npm/iobroker.tibber/)

**Tests:** ![Test and Release](https://github.com/Magnus8513/ioBroker.tibber/workflows/Test%20and%20Release/badge.svg)

testing discussions/feedback are encouraged as issues here, or via: 
[Link zum Test Thema im Forum](https://forum.iobroker.net/topic/46954/test-adapter-tibber-v0-1-x)

## tibber adapter for ioBroker

This Adapter is meant to allow integration of the services tibber offers via their API to iobroker.

Upon first run the adapter currently is preconfigured with the demo token. To access your personal data, please add your tibber token to the config.

implemented functionality:
* pulls price date for the next two days to allow usage as a source for appliances to pick grid friendly times to run.
* offers "calculation function" that returns the best start for an appliance to run for a given time and max end time.
  * usage instructions:
    1. populate the following fields in the calculation channel
       a. Duration : hours as integer that the appliance will run), 
       b. LastEnd : DateTime as ISO String by when appliance needs to finish latest
    2. set "GetBestTime" to true
    3. Read return from fields:
       a. Feedback: list of best hours or Error Message
       b. BestStart: DateTime for optimal Start
       c. CronString: cronstring to schedule start of appliance at BestStart

planned functionality:
* get actual consumption values
* calculate money saved/spend by hourly vs. monthly contracting
* your ideas -> leave me an issue here or join the discussion in the forum (see link above)


## Changelog
<!--
    Placeholder for the next version (at the beginning of the line):
    ### **WORK IN PROGRESS**
-->
* (Magnus8513) v0.2.0-beta feature update release 
  * added calculations logic
  * code optimizations

* (Magnus8513) v0.1.0-beta first (beta) release
  * added currency key
  * aligned version tag for beta testing
  
* (Magnus8513) v0.0.2-alpha second (alpha) release
  * added hourly refresh
  * added "current" date to display the current hour data
  * added some initial error handling
  * added prefill with demo token
  
* (Magnus8513) v0.0.1-alpha initial (alpha) release 


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
