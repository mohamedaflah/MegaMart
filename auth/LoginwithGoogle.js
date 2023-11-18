const passport = require("passport");
require("dotenv").config();
const bcrypt=require('bcrypt')
const passGenerator=require('generate-password')
const UserCollection = require("../model/collections/UserDb");
const { sendMailforUser } = require("../helper/sendmail");
const GoogleStrategy = require("passport-google-oauth2").Strategy;

passport.use(
  "google-login",
  new GoogleStrategy(
    {
      clientID: process.env.LOGIN_CLIENT_ID,
      clientSecret: process.env.LOGIN_SECRET_ID,
      callbackURL: "https://aflahaflu.shop/auth/google/login/callback",
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
        if(!existingUser){
          let hashedPassword=passGenerator.generate({
            length:10,
            numbers:true,
          })
          let password=hashedPassword=bcrypt.hashSync(hashedPassword,10)
          let userInformation = {
            name: profile.displayName,
            email: profile.email,
            password:password,
            profileImage: profile.picture,
            emailAuth: true,
            joinDate: Date.now(),
          };
          sendMailforUser(profile.email,"MegaMart Secret Password",hashedPassword)
          await new UserCollection({
            userInformation
          }).save()
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
