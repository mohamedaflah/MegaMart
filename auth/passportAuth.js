const passport = require("passport");
require("dotenv").config();
const UserCollection = require("../model/UserDb");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5001/auth/google/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try{

        for (data in profile) {
          console.log(data + ":" + profile[data] + "   ___enered data");
        }
        const existingUser = await UserCollection.findOne({ email: profile.email });
        if (existingUser) {
          // Authentication failed due to duplicate email
          return done(null, false, { message: "Duplicate email found." });
        }
        let userInformation = {
          name: profile.displayName,
          email: profile.email,
          profileImage: profile.picture,
          emailAuth: true,
          joinDate:Date.now()
        };
        // Save the new user data to the database
        await new UserCollection(userInformation).save();
        // request.session.userAuth = true;
        done(null, profile);
      }catch(err){
        console.log('error found whle passpor'+err);
      }
      //   console.log("profile is ____________" + profile.displayName);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
