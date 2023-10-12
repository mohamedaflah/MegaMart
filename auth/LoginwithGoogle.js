const passport = require("passport");
require("dotenv").config();
const UserCollection = require("../model/collections/UserDb");
const GoogleStrategy = require("passport-google-oauth2").Strategy;

passport.use(
  "google-login",
  new GoogleStrategy(
    {
      clientID: process.env.LOGIN_CLIENT_ID,
      clientSecret: process.env.LOGIN_SECRET_ID,
      callbackURL: "http://localhost:5001/auth/google/login/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        console.log("Reached in Login Google Strategy");
        for (const data in profile) {
          console.log(data + ": " + profile[data] + " (Login data)");
        }

        // Check if the user is already registered (based on email)
        const existingUser = await UserCollection.findOne({
          email: profile.email,
        });

        if (!existingUser) {
          // If the user is not registered, you can handle this case as needed.
          // You can redirect them to a signup page or show an error message.
          return done(null, false, { message: "User not registered." });
        }

        // User is registered, so log them in
        request.session.userAuth = true;
        done(null, profile);
      } catch (err) {
        console.error("Error during Google login:", err);
        done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
