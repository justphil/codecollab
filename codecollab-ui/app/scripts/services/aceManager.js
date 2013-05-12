'use strict';

angular.module('codecollabUiApp')
    .factory('aceManager', ['$window', function ($window) {
        var aceInstances;                       // element id -> editor instance
        var interestedInRegistrationCallbacks;  // element id -> array of callback functions
        var Range = $window.ace.require('ace/range').Range;

        var reset = function() {
            aceInstances                        = {};
            interestedInRegistrationCallbacks   = {};
        };

        reset();

        var invokeInterestedInRegistrationCallbacks = function(elementId, aceInstance) {
            if (interestedInRegistrationCallbacks.hasOwnProperty(elementId)
                && angular.isArray(interestedInRegistrationCallbacks[elementId])) {
                var callbackArray = interestedInRegistrationCallbacks[elementId];

                for (var i = 0; i < callbackArray.length; i++) {
                    var fn = callbackArray[i];
                    fn(aceInstance);
                }
            }
        };

        // Public API
        return {
            reset: function() {
                reset();
            },
            registerAceInstance: function (elementId, aceInstance) {
                if (angular.isString(elementId) && angular.isObject(aceInstance)) {
                    // extend ace editor with own functions / properties
                    aceInstance.changeEventsEnabled = true;

                    aceInstance.disableChangeEvents = function() {
                        aceInstance.changeEventsEnabled = false;
                    };

                    aceInstance.enableChangeEvents = function() {
                        aceInstance.changeEventsEnabled = true;
                    };

                    aceInstance.isChangeEventsEnable = function() {
                        return aceInstance.changeEventsEnabled;
                    };

                    aceInstances[elementId] = aceInstance;
                    invokeInterestedInRegistrationCallbacks(elementId, aceInstance);

                    console.log('aceInstance registered', elementId);
                    return true;
                }
                else {
                    return false;
                }
            },
            getAceInstanceByElementId: function(elementId, callbackFn) {
                if (aceInstances.hasOwnProperty(elementId) && !angular.isUndefined(aceInstances[elementId])) {
                    callbackFn(aceInstances[elementId]);
                }
                else {
                    var callbackArray;

                    if (interestedInRegistrationCallbacks.hasOwnProperty(elementId)
                        && angular.isArray(interestedInRegistrationCallbacks[elementId])) {
                        callbackArray = interestedInRegistrationCallbacks[elementId];
                    }
                    else {
                        callbackArray = [];
                        interestedInRegistrationCallbacks[elementId] = callbackArray;
                    }

                    callbackArray.push(callbackFn);
                }
            },
            createNewRange: function(startRow, startColumn, endRow, endColumn) {
                return new Range(startRow, startColumn, endRow, endColumn);
            }
        };
    }]);
