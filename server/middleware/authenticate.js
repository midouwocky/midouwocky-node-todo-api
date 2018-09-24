var { User } = require('../models/user');

module.exports.authenticate = (roleToAuth) => {
    return async (req, res, next) => {
        var token = req.header('x-auth');

        try {
            var user = await User.findByToken(token);
            if (!user) {
                throw new Error();
            }
            if (roleToAuth) {
                
                var authorized = false;
                user.roles.forEach(role => {
                    if (role.name === roleToAuth) {
                        authorized = true;
                    }
                });
                if (!authorized) {
                    throw new Error();
                }
            }
            req.user = user;
            req.token = token;
            next();
        } catch (error) {
            res.status(401).send();
        }

    }
}