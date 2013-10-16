'use strict';

/* Services */

var materialsCommonsServices = angular.module('materialsCommonsServices', ['ngResource']);

materialsCommonsServices.
    factory('User', function ($cookieStore) {
        var self = this;
        self.mcuser = $cookieStore.get('mcuser');

        return {
            isAuthenticated: function () {
                return self.mcuser;
            },

            setAuthenticated: function (authenticated, apikey, email) {
                if (!authenticated) {
                    $cookieStore.remove('mcuser');
                    self.mcuser = undefined;
                } else {
                    var mcuser = {};
                    mcuser.apikey = apikey;
                    mcuser.email = email;
                    $cookieStore.put('mcuser', mcuser);
                    self.mcuser = mcuser;
                }
            },

            apikey: function () {
                return self.mcuser ? self.mcuser.apikey : undefined;
            },

            u: function () {
                return self.mcuser ? self.mcuser.email : 'Login';
            },

            reset_apikey: function (new_key) {
                if (self.mcuser) {
                    self.mcuser.apikey = new_key;
                    $cookieStore.put('mcuser', self.mcuser);
                }
            }
        };
    });

materialsCommonsServices.
    factory('Search', function ($resource) {
        var data;
        var host_name = document.location.hostname;
        var resource_obj = $resource('http://' + host_name + '\\:9200/mcindex/materialscommons/_search', {});

        return {
            get_all_info: function (keyword, fun) {
                //return resource_obj.get(fun)
                return resource_obj.get({q: keyword}, fun);
                //return resource_obj.get({q:keyword, "from" : 0, "size" : 8} , fun);
            },

            get_set_of_results_for_pagination: function (keyword, from, size, fun) {
                return resource_obj.get({q: keyword, "from": from, "size": size}, fun);
            }
        };
    });

materialsCommonsServices.factory('formDataObject', function () {
    return function (data) {
        var fd = new FormData();
        angular.forEach(data, function (value, key) {
            fd.append(key, value);
        });
        return fd;
    };
});

materialsCommonsServices.factory('alertService', function ($rootScope) {
    var sharedService = {};
    sharedService.message = '';

    sharedService.prepForBroadcast = function (msg) {
        this.message = msg;
        this.broadcastItem();
    };

    sharedService.broadcastItem = function () {
        $rootScope.$broadcast('handleBroadcast')
    };

    return sharedService;
});

materialsCommonsServices.factory('pubsub', function ($rootScope) {
    var pubsubService = {};
    pubsubService.message = '';

    pubsubService.send = function (channel, msg) {
        this.message = msg;
        $rootScope.$broadcast(channel);
    }

    pubsubService.waitOn = function (scope, channel, fn) {
        scope.$on(channel, function () {
            fn(pubsubService.message);
        });
    }

    return pubsubService;
});

materialsCommonsServices.factory('watcher', function () {
    var watcherService = {};

    watcherService.watch = function (scope, variable, fn) {
        scope.$watch(variable, function (newval, oldval) {
            if (!newval && !oldval) {
                return;
            }
            else if (newval == "" && oldval) {
                fn(oldval);
            } else {
                fn(newval);
            }
        });
    }

    return watcherService;
});


materialsCommonsServices.factory('mcapi', function ($http, User) {
    function MCApi() {
        this.url = this._makeUrl.apply(this, arguments);
        this.on_error = undefined;
        this.on_success = undefined;
    }

    MCApi.prototype._makeUrl = function () {
        var apihost = mcglobals.apihost ? mcglobals.apihost : "https://api.materialscommons.org/v1.0";

        if (arguments.length < 1) {
            throw "Invalid url spec";
        }

        var s = arguments[0];

        for (var i = 1; i < arguments.length; i++) {
            s = s.replace('%', arguments[i]);
        }

        var url = apihost + s + "?apikey=" + User.apikey();
        return url;
    }

    MCApi.prototype.success = function (on_success) {
        this.on_success = on_success;
        return this;
    }

    MCApi.prototype.error = function (on_error) {
        this.on_error = on_error;
        return this;
    }

    MCApi.prototype.arg = function (a) {
        /*
         ** There is always a ?apikey=xxx on the url so all additional args
         ** are &'d onto the url
         */
        this.url = this.url + "&" + a;
        return this;
    }

    MCApi.prototype.argWithValue = function (a, v) {
        this.url = this.url + "&" + a + "=" + v;
        return this;
    }

    MCApi.prototype.put = function (putData, putConfig) {
        var self = this;
        $http.put(this.url, putData, putConfig)
            .success(function (data, status, headers, config) {
                if (self.on_success) {
                    self.on_success(data, status, headers, config);
                }
            })
            .error(function (data, status, headers, config) {
                if (self.on_error) {
                    self.on_error(data, status, headers, config);
                }
            })
    }

    MCApi.prototype.delete = function (deleteConfig) {
        var self = this;
        $http.delete(this.url, deleteConfig)
            .success(function (data, status, headers, config) {
                if (self.on_success) {
                    self.on_success(data, status, headers, config);
                }
            })
            .error(function (data, status, headers, config) {
                if (self.on_error) {
                    self.on_error(data, status, headers, config);
                }
            })
    }

    MCApi.prototype.post = function (postData, postConfig) {
        var self = this;
        $http.post(this.url, postData, postConfig)
            .success(function (data, status, headers, config) {
                if (self.on_success) {
                    self.on_success(data, status, headers, config);
                }
            })
            .error(function (data, status, headers, config) {
                if (self.on_error) {
                    self.on_error(data, status, headers, config);
                }
            })
    }

    MCApi.prototype.get = function (getConfig) {
        var self = this;
        $http.get(this.url, getConfig)
            .success(function (data, status, headers, config) {
                if (self.on_success) {
                    self.on_success(data, status, headers, config);
                }
            })
            .error(function (data, status, headers, config) {
                if (self.on_error) {
                    self.on_error(data, status, headers, config);
                }
            })
    }

    MCApi.prototype.jsonp = function (jsonpConfig) {
        var self = this;
        var jsonpurl = _add_json_callback(this.url);
        $http.jsonp(jsonpurl, jsonpConfig)
            .success(function (data) {
                if (data.success) {
                    if (self.on_success) {
                        self.on_success.call(self, data.data, data.status_code);
                    }
                } else {
                    if (self.on_error) {
                        self.on_error.call(self, data.data, data.status_code);
                    }
                }
            })
    }

    return function () {
        function F2(args) {
            return MCApi.apply(this, args);
        }

        F2.prototype = MCApi.prototype;
        return new F2(arguments);
    }

});

materialsCommonsServices.factory('decodeAlerts', function () {
    var alert_msg = {
        'forbidden': 'Access Denied',
        'bad request': 'Error:  Please try again',
        'account exists': 'Error: Account already Exists',
        'usergroup exists': 'Error: Usergroup already exists. Try with new usergroup name',
        'problem adding tag': 'Error: There was a problem adding the tag'
    };
    return {
        get_alert_msg: function (key) {
            return alert_msg[key];
        }
    }
});


materialsCommonsServices.factory('Thumbnail', function () {
    var fileType = '';
    var fileSrc = '';
    return {
        fetch_images: function (datafiles) {
            var images = [];
            datafiles.forEach(function (item) {
                fileType = determineFileType(item.mediatype);
                if (fileType == 'image') {
                    fileSrc = filePath(fileType, item.mediatype, item.location, item.name);
                    images.push({'file': item, 'link': fileSrc})
                }

            });

            return images;
        }
    }
});


materialsCommonsServices.factory('formatData', function () {
    var all_process = [];
    var new_conditions_format = [];
    return {
        convert_into_gridoptions: function (process) {
            process.forEach(function (pr) {
                var one_process = [];
                var keys = Object.keys(pr);
                keys.forEach(function (k) {
                    var template = {'name': k, 'value': pr[k]}
                    one_process.push(template);
                })
                all_process.push(one_process)
            })
            return all_process;
        },

        reformat_conditions: function (conditions) {
            conditions.forEach(function (c) {
                var row = {'name': c, 'value': ''}
                new_conditions_format.push(row)
            })
            return new_conditions_format;
        }
    }

});

materialsCommonsServices.factory('wizardSteps', function () {
    var currentStep = {};

    return {
        setCurrent: function(wizardName, stepName) {
            currentStep[wizardName] = stepName;
        },

        getCurrent: function(wizardName) {
            return currentStep[wizardName];
        }
    }
});
