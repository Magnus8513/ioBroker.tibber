'use strict';

/*
 * Created with @iobroker/create-adapter v1.34.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
const fetch = require('node-fetch');

class Tibber extends utils.Adapter {

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


    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here

        // The adapters config (in the instance object everything under the attribute "native") is accessible via
        // this.config:
        var api_url = "https://api.tibber.com/v1-beta/gql";
        var access_token = this.config.access_token;
		var graphql_query = "{viewer {homes {currentSubscription {priceInfo {today {total energy tax startsAt} tomorrow {total energy tax startsAt}}}}}}"
		var myHeaders = new fetch.Headers();
		myHeaders.append("Authorization", "Bearer " + access_token);
		myHeaders.append("Content-Type", "application/json");

		var graphql = JSON.stringify({
			query: graphql_query,
			//variables: {}
		});
		var requestOptions = {
			method: 'POST',
			headers: myHeaders,
			body: graphql,
			redirect: 'follow'
		};
		function subsequenceFromEndLast(sequence, at1) {
			var start = sequence.length - 1 - at1;
			var end = sequence.length;
			return sequence.slice(start, end);
		};

	//	function get_API_data(api_url, requestOptions1) {
			fetch('https://api.tibber.com/v1-beta/gql', requestOptions)
				.then(response => {

					if (!response.ok) {
						throw new Error('Network response was not ok. response status: ' + response.status);
					};
					const contentType = response.headers.get('content-type');
					if (!contentType || !contentType.includes('application/json')) {
						throw new TypeError("Did not receive expected JSON response from Tibber API - Did Tibber API change?");
					};

					return response.json();
				})
				.then(result => {
					// check for API error response (e.g. invalid token);
					 if (typeof result.errors !== 'undefined') {
					 	throw new Error('Tibber API returned error message:  ' + result.errors[0].message);
					 };

					var day_list = ['today', 'tomorrow'];
					var key_list = ['total', 'energy', 'tax', 'startsAt'];

					var hour = '';
					for (var day_index in day_list) {
						var day = day_list[day_index];
						for (var key_index in key_list) {
							var key = key_list[key_index];

							for (let i = 0; i <= 23; i++) {
								hour = subsequenceFromEndLast('0' + i, 1);
								//this.log.info(hour);
								var state_name = 'priceInfo.' + day + '.' + hour + '.' + key;

								//creating states for price info data if not yet existing:
								var state_type = 'number'
								if (key == 'startsAt') {
									state_type = 'string';
								};
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
							};
						};
					};
					// setTimeout(function() {
					// this.log.info("Callback Funktion wird aufgerufen");
					// }, 3000);

					//very ugly solution for a timing issue todo: will rebuild this to work better e.g. w/ callback a callback function
					for ( day_index in day_list) {
						day = day_list[day_index];

						for (key_index in key_list) {
							key = key_list[key_index];

							for (let j = 0; j <= 23; j++) {
								hour = subsequenceFromEndLast('0' + j, 1);
								var state_name = 'priceInfo.' + day + '.' + hour + '.' + key;
								var value = null;
								if (result.data.viewer.homes[0].currentSubscription.priceInfo[day].length > 0) {
									value = result.data.viewer.homes[0].currentSubscription.priceInfo[day][j][key];
								};

									this.setStateAsync(state_name, {
									val: value,
									ack: true
								});
							};
						};
					};
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

            callback();
        } catch (e) {
            callback();
        }
    }

    

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }

  
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