(function (module) {
    module.factory('User',
        ["$window", function ($window) {
            var self = this;
            if ($window.sessionStorage.mcuser) {
                try {
                    self.mcuser = JSON.parse($window.sessionStorage.mcuser);
                } catch (err) {
                    console.log("Error parse mcuser in sessionStorage");
                    self.mcuser = null;
                }
            }

            return {
                isAuthenticated: function () {
                    return self.mcuser;
                },

                setAuthenticated: function (authenticated, u) {
                    if (!authenticated) {
                        $window.sessionStorage.mcuser = null;
                        self.mcuser = undefined;
                    } else {
                        if (! u.favorites) {
                            u.favorites = {};
                        }
                        $window.sessionStorage.mcuser = JSON.stringify(u);
                        self.mcuser = u;
                    }
                },

                apikey: function () {
                    return self.mcuser ? self.mcuser.apikey : undefined;
                },

                u: function () {
                    return self.mcuser ? self.mcuser.email : 'Login';
                },

                attr: function () {
                    return self.mcuser;
                },

                reset_apikey: function (new_key) {
                    if (self.mcuser) {
                        self.mcuser.apikey = new_key;
                        $window.sessionStorage.mcuser = JSON.stringify(self.mcuser);
                    }
                },

                save: function () {
                    if (self.mcuser) {
                        $window.sessionStorage.mcuser = JSON.stringify(self.mcuser);
                    }
                }


            };
        }]);
}(angular.module('materialscommons')));
