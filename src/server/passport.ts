/// <reference path="../types/types.ts"/>

import express = require('express');
import passportLocal = require('passport-local');
//import account = require('./Repo/Account');

class Passport {
    public static configure(passport) {
        var LocalStrategy = passportLocal.Strategy;

        // serialize user into session
        passport.serializeUser((user, done) => {
            //console.log('serializeUser');
            //console.dir(user);
            done(null, user);
        });

        // serialize user from session
        passport.deserializeUser((user, done) => {
            // object passed in the done function is available at req.user
            //console.log('deserializeUser')
            //console.dir(user);
            done(null, user);
        });

        passport.use('local', new LocalStrategy({
                    // by default, local strategy uses username and password, we will override with email
                    usernameField: 'email',
                    passwordField: 'password',
                    passReqToCallback: true // allows us to pass back the entire request to the callback
                },
                (req: express.Request, email, password, done)=> {
                    // asynchronous
                    process.nextTick(()=> {
                        // validate password
                        /*account.getByEmailPw(email, password).then(
                            (session)=> {
                                //console.dir(session);
                                if (session)
                                    return done(null, session);
                                else {
                                    return done(null, false, { message: 'Incorrect email or password.' });
                                }
                            },
                            (err)=> {
                                console.log(err.stack);
                                return done(null, false, err);
                            }
                        );*/
                        return done(null, { name: 'tempName' });
                    });
                }
            )
        );
    }
}

export = Passport;