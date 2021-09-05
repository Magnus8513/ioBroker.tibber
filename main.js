'use strict';

/*
 * Created with @iobroker/create-adapter v1.34.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
const fetch = require('node-fetch');
const schedule = require('node-schedule');
const { DateTime } = require("luxon");

class Tibber extends utils.Adapter {
	apiUrl ="https://api.tibber.com/v1-beta/gql";
	requestOptions = null;

    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'tibber',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        // this.on('objectChange', this.onObjectChange.bind(this));
        // this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }
    async init() {
		// Initialize your adapter here

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:

		const myHeaders = new fetch.Headers();
		myHeaders.append("Authorization", "Bearer " + this.config.access_token);
		myHeaders.append("Content-Type", "application/json");

		const graphql_query = "{viewer {homes {currentSubscription {priceInfo {current {total energy tax currency startsAt} today {total energy tax currency startsAt} tomorrow {total energy tax currency startsAt}}}}}}",
			graphql = JSON.stringify({
			query: graphql_query,
			//variables: {}
		});
		this.requestOptions = {
			method: 'POST',
			headers: myHeaders,
			body: graphql,
			redirect: 'follow'
		};

		/*
        For every state in the system there has to be also an object of type state
        Here a simple template for a boolean variable named "testVariable"
        Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
        */

		//set variables for best hour calculations:
		await this.setObjectNotExistsAsync('calculations.GetBestTime', {
			type: 'state',
			common: {
				name: 'GetBestTime',
				type: 'boolean',
				role: 'indicator',
				read: true,
				write: true,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync('calculations.LastEnd', {
			type: 'state',
			common: {
				name: 'LastEnd',
				type: 'string',
				role: 'indicator',
				read: true,
				write: true,
			},
			native: {},
		});
		/*await this.setObjectNotExistsAsync('calculations.FirstStart', {
			type: 'state',
			common: {
				name: 'FirstStart',
				type: 'string',
				role: 'indicator',
				read: true,
				write: true,
			},
			native: {},
		});*/
		await this.setObjectNotExistsAsync('calculations.Duration', {
			type: 'state',
			common: {
				name: 'duration',
				type: 'number',
				role: 'indicator',
				read: true,
				write: true,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync('calculations.BestStart', {
			type: 'state',
			common: {
				name: 'BestStart',
				type: 'string',
				role: 'indicator',
				read: true,
				write: true,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync('calculations.CronString', {
			type: 'state',
			common: {
				name: 'CronString',
				type: 'string',
				role: 'indicator',
				read: true,
				write: true,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync('calculations.Feedback', {
			type: 'state',
			common: {
				name: 'Feedback',
				type: 'string',
				role: 'indicator',
				read: true,
				write: true,
			},
			native: {},
		});



	}


    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here

        // The adapters config (in the instance object everything under the attribute "native") is accessible via
        // this.config:

		this.init();
		this.get_API_data();


		//this.regular_refresh = setInterval(get_API_data, 6000,self1, api_url1, requestOptions1);

		this.job = schedule.scheduleJob('0 * * * *', () => {
			this.get_API_data();
		});





		// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		this.subscribeStates('calculations.GetBestTime');
		// You can also add a subscription for multiple states. The following line watches all states starting with "lights."
		// this.subscribeStates('lights.*');
		// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
		// this.subscribeStates('*');

		//		.catch(error => Tibber.log.error('error during call: ' + error));
    }


	get_API_data (){
		fetch(this.apiUrl, this.requestOptions)
			.then(response => {

				if (!response.ok) {
					throw new Error('Network response was not ok. response status: ' + response.status);
				}
				const contentType = response.headers.get('content-type');
				if (!contentType || !contentType.includes('application/json')) {
					throw new TypeError("Did not receive expected JSON response from Tibber API - Did Tibber API change?");
				}

				return response.json();
			})
			.then(result => {
				// check for API error response (e.g. invalid token);
				if (typeof result.errors !== 'undefined') {
					throw new Error('Tibber API returned error message:  ' + result.errors[0].message);
				}

				var day_list = ['current', 'today', 'tomorrow'];
				var key_list = ['total', 'energy', 'tax', 'currency', 'startsAt'];

				var hour = '';
				var state_name = '';
				let value = null;
				for (var day_index in day_list) {
					var day = day_list[day_index];
					for (var key_index in key_list) {
						var key = key_list[key_index];
						var state_type = 'number'
						//create states and fill them for current hour
						if (['startsAt','currency'].includes(key)) {
							state_type = 'string';
						}
						if (day === 'current') {
							state_name = 'priceInfo.current.' + key;
							this.setObjectNotExistsAsync(state_name, {
								type: 'state',
								common: {
									name: key,
									type: state_type,
									role: 'indicator',
									read: true,
									write: true,
								},
								native: {},
							});
							value = result.data.viewer.homes[0].currentSubscription.priceInfo.current[key];


							this.setStateAsync(state_name, {
								val: value,
								ack: true
							});

						}
						//do the same for today and tomorrow for all hours
						else {
							for (let i = 0; i <= 23; i++) {
								hour = this.subsequenceFromEndLast('0' + i, 1);
								//this.log.info(hour);
								state_name = 'priceInfo.' + day + '.' + hour + '.' + key;

								//creating states for price info data if not yet existing:

								//this.log.info(state_name);
								this.setObjectNotExistsAsync(state_name, {
									type: 'state',
									common: {
										name: key,
										type: state_type,
										role: 'indicator',
										read: true,
										write: true,
									},
									native: {},
								});

								//write values (currently throws warning as state might not yet exist when executed. todo: lookinto solving this with callback function on state creation
								let value = null;
								if (result.data.viewer.homes[0].currentSubscription.priceInfo[day].length > 0) {
									value = result.data.viewer.homes[0].currentSubscription.priceInfo[day][i][key];
								}

								this.setStateAsync(state_name, {
									val: value,
									ack: true
								});
							}
						}
					}
				}

				this.log.info('Tibber refresh success');
			})
			//.catch(error => this.log.error('error' + error));
			.catch(error => this.log.error('error during API fetch: ' + error));
	}

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            // clearTimeout(timeout1);
            // clearTimeout(timeout2);
            // ...
            // clearInterval(interval1);
			//clearInterval(this.regular_refresh);
			this.job.cancel();
            callback();
        } catch (e) {
            callback();
        }
    }

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.

	// /**
	//  * Is called if a subscribed object changes
	//  * @param {string} id
	//  * @param {ioBroker.Object | null | undefined} obj
	//  */
	// onObjectChange(id, obj) {
	//     if (obj) {
	//         // The object was changed
	//         this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	//     } else {
	//         // The object was deleted
	//         this.log.info(`object ${id} deleted`);
	//     }
	// }
    

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
  	async onStateChange(id, state) {
		if (state) {
			try {
				if (id === this.namespace + '.calculations.GetBestTime' && state.val === true) {
					let Duration = await this.getStateAsync(this.namespace + '.calculations.Duration');
					let LastEnd = await this.getStateAsync(this.namespace + '.calculations.LastEnd');

					await this.setStateAsync(this.namespace + '.calculations.CronString', {
						val: '',
						ack: true
					});
					await this.setStateAsync(this.namespace + '.calculations.BestStart', {
						val: '',
						ack: true
					});
					let result = await this.get_best_timeslot(Duration.val, LastEnd.val);
					// The state was changed
					//this.log.info('string: ' + this.namespace + '.calculations.GetBestTime');
					this.log.info('Duration: ' + Duration.val + ', LastEnd: ' + LastEnd.val + ', result: ' + result);
					this.log.info('stringified result: ' + JSON.stringify(result));

					//this.log.info(`(inner) state ${id} changed: ${state.val} (ack = ${state.ack})`);
					await this.setStateAsync(this.namespace + '.calculations.Feedback', {
						val: JSON.stringify(result),
						ack: true
					});

					let now = DateTime.now()
					let day = now.c.day
					if (now.c.hour > result[0]) {
						day += 1;
					}
					let BestStart = DateTime.fromObject({
						year: now.c.year,
						month: now.c.month,
						day: day,
						hour: result[0]
					});
					await this.setStateAsync(this.namespace + '.calculations.BestStart', {
						val: BestStart,
						ack: true
					});
					let startdate = DateTime.fromObject({
						year: now.c.year,
						month: now.c.month,
						day: day
					});
					let cron = ['{"time":{"exactTime":true,"start":"',BestStart.c.hour,':00"},"period":{"once":"',startdate,'"}}'].join('');
					await this.setStateAsync(this.namespace + '.calculations.CronString', {
						val: cron,
						ack: true
					});


					await this.setStateAsync(this.namespace + '.calculations.GetBestTime', {
						val: false,
						ack: true
					});

				}
			} catch(error) {
				this.log.error(error);
				await this.setStateAsync(this.namespace + '.calculations.GetBestTime', {
					val: false,
					ack: true
				});
			}

			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
			//this.log.info(`state ${id} changed: ${state.name} (ack = ${state.id})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
    }


	subsequenceFromEndLast(sequence, at1) {
		let start = sequence.length - 1 - at1,
			end = sequence.length;
		return sequence.slice(start, end);
	};
	listsGetSortCompare(type, direction) {
		var compareFuncs = {
			"NUMERIC": function(a, b) {
				return Number(a) - Number(b); },
			"TEXT": function(a, b) {
				return a.toString() > b.toString() ? 1 : -1; },
			"IGNORE_CASE": function(a, b) {
				return a.toString().toLowerCase() > b.toString().toLowerCase() ? 1 : -1; },
		};
		var compare = compareFuncs[type];
		return function(a, b) { return compare(a, b) * direction; }
	};
	async get_best_timeslot(hours, LastEnd) {
		//todo: integration usage of "firstStart"
		//todo: rename hours to Duration
		try {
			if(!DateTime.fromISO(LastEnd).isValid) {
				let ErrorMsg = 'Entry provided for LastEnd is no valid formatted Date (expect ISO 8601 string). LastEnd: ' + LastEnd;
				await this.setStateAsync(this.namespace + '.calculations.Feedback', {
					val: 'Error: ' + ErrorMsg,
					ack: true
				});
				throw new Error(ErrorMsg);
			}
			if(!Number.isInteger(hours)) {
				let ErrorMsg = 'Entry provided for Duration is no integer. Duration: ' + hours;
				await this.setStateAsync(this.namespace + '.calculations.Feedback', {
					val: 'Error: ' + ErrorMsg,
					ack: true
				});
				throw new Error(ErrorMsg);
			}

			let now = DateTime.now()
			let LastEndDate = DateTime.fromISO(LastEnd)
			let ErrorMsg = ''
			if(LastEndDate < now) {
				ErrorMsg = 'Entry provided for LastEnd in the past. LastEnd: ' + LastEnd;
			}
			if(LastEndDate.c.day > now.c.day + 1 ) {
				ErrorMsg = 'LastEnd to far in future - price data only available until tomorrow midnight. LastEnd: ' + LastEnd;
			}
			if(now.c.hour < 13 && LastEndDate.c.day > now.c.day ) {
				ErrorMsg = 'LastEnd too far in future - price data for tomorrow only available after 1pm today. LastEnd: ' + LastEnd;
			}
			if(now.plus({ hours: hours})  >= LastEndDate ) {
				ErrorMsg = 'LastEnd too soon for given duration. LastEnd: ' + LastEnd + ', duration: ' + hours;
			}
			if(ErrorMsg !== '') {
				await this.setStateAsync(this.namespace + '.calculations.Feedback', {
					val: 'Error: ' + ErrorMsg,
					ack: true
				});
				throw new Error(ErrorMsg);
			}

			let current_hour = now.c.hour;
			let maxhour = LastEndDate.c.hour

			let Preise = [];
			let state = '';
			if (now.c.day < LastEndDate.c.day) {
				let i_inc = 1;
				if ((current_hour + 1) > 23) {
					i_inc = -i_inc;
				}
				for (let i = (current_hour + 1) ; i_inc >= 0 ? i <= 23 : i >= 23; i += i_inc) {
					let id = this.namespace + '.priceInfo.today.' + this.subsequenceFromEndLast('0' + String('' + i), 1) + '.total';
					state = await this.getStateAsync(id);
					//let state = await this.getStateAsync(this.namespace + '.calculations.Feedback');

					//this.log.info(this.namespace + '.calculations.Feedback');
					//this.log.info(i + ' ' + state.val);
					Preise.push(state.val);

				}
				let i_inc2 = 1;
				if (0 > maxhour) {
					i_inc2 = -i_inc2;
				}
				for (let i = 0; i_inc2 >= 0 ? i < maxhour : i >= maxhour; i += i_inc2) {
					state = await this.getStateAsync(([this.namespace + '.priceInfo.tomorrow.',this.subsequenceFromEndLast(('0' + String(('' + i))), 1),'.total'].join('')))
					Preise.push(state.val);
				}
			} else {
				let i_inc3 = 1;
				if ((current_hour+1) > maxhour) {
					i_inc3 = -i_inc3;
				}
				for (let i = (current_hour+1); i_inc3 >= 0 ? i < maxhour : i >= maxhour; i += i_inc3) {
					state = await this.getStateAsync(this.namespace + '.priceInfo.today.' + this.subsequenceFromEndLast('0' + String('' + i), 1) + '.total');
					Preise.push(state.val);
				}
			}
			console.log(maxhour);
			console.log(Preise);
			let prices_sorted = Preise.slice().sort(this.listsGetSortCompare("NUMERIC", 1));
			let best_hours = [];
			for (let count = 0; count < hours; count++) {
				let low = prices_sorted.shift();
				let low_hour = (current_hour  + Preise.indexOf(low) + 1);
				best_hours.push(low_hour < 24 ? low_hour : low_hour - 24);
				Preise[((Preise.indexOf(low) + 1) - 1)] = 9;
			}
			return best_hours.slice().sort(this.listsGetSortCompare("NUMERIC", 1));
		} catch(error) {
			error = 'error during calculation of best hours: ' + error;
			throw new Error(error);
		}

	};
  
}

if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new Tibber(options);
} else {
    // otherwise start the instance directly
    new Tibber();
}