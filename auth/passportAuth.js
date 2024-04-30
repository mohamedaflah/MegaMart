const passport = require("passport");
const bcrypt=require('bcryptjs')
const passwordGenerator = require("generate-password");
require("dotenv").config();
const UserCollection = require("../model/collections/UserDb");
const { sendMailforUser } = require("../helper/sendmail");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
// Signup Strategy start
passport.use(
  "google-signup",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://aflahaflu.shop/auth/google/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        const action = request.path;
        console.log(JSON.stringify(action) + "+++++++++++++++++++_");
        for (data in profile) {
          console.log(data + ":" + profile[data] + "   ___enered data");
        }
        const existingUser = await UserCollection.findOne({
          email: profile.email,
        });
        if (existingUser) {
          // Authentication failed due to duplicate email
          return done(null, false, { message: "Duplicate email found." });
        }
        let password = passwordGenerator.generate({
          length: 10,
          numbers: true,
        });

        const hashedPassword=bcrypt.hashSync(password,10)
        let userInformation = {
          name: profile.displayName,
          email: profile.email,
          password:hashedPassword,
          profileImage: profile.picture,
          emailAuth: true,
          joinDate: Date.now(),
        };
        // Save the new user data to the database
        sendMailforUser(profile.email,"MegaMart Secret Password",password)
        await new UserCollection(userInformation).save();
        request.session.userEmail = profile.email;
        done(null, profile);
      } catch (err) {
        console.log("error found whle passpor" + err);
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


