/** @license MIT License (c) copyright B Cavalier & J Hann */

/**
 * timeout.js
 *
 * Helper that returns a promise that rejects after a specified timeout,
 * if not explicitly resolved or rejected before that.
 *
 * @author brian@hovercraftstudios.com
 */

(function(define) {
define(function(require) {
	/*global vertx,setTimeout,clearTimeout*/
    var when, setTimer, cancelTimer, undef;

	when = require('./when');

	if(typeof vertx === 'object') {
		setTimer = function (f, ms) { return vertx.setTimer(ms, f); };
		cancelTimer = vertx.cancelTimer;
	} else {
		setTimer = setTimeout;
		cancelTimer = clearTimeout;
	}

    /**
     * Returns a new promise that will automatically reject after msec if
     * the supplied promise doesn't resolve or reject before that.
     *
     * Usage:
     *
     * var d = when.defer();
     * // Setup d however you need
     *
     * // return a new promise that will timeout if d doesn't resolve/reject first
     * return timeout(d.promise, 1000);
     *
     * @param promise anything - any promise or value that should trigger
     *  the returned promise to resolve or reject before the msec timeout
     * @param msec {Number} timeout in milliseconds
     *
     * @returns {Promise}
     */
    return function timeout(promise, msec) {
        var deferred, timeoutRef;

        deferred = when.defer();

        timeoutRef = setTimer(function onTimeout() {
            timeoutRef && deferred.reject(new Error('timed out'));
        }, msec);

        function cancelTimeout() {
            cancelTimer(timeoutRef);
            timeoutRef = undef;
        }

        when(promise,
            function(value) {
                cancelTimeout();
                deferred.resolve(value);
            },
            function(reason) {
                cancelTimeout();
                deferred.reject(reason);
            },
			deferred.notify
        );

        return deferred.promise;
    };

});
})(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
);


