const passport = require("passport");
require("dotenv").config();
const UserCollection = require("../model/collections/UserDb");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
// Signup Strategy start
passport.use(
  "google-signup",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5001/auth/google/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {

      try {
        const action = request.path;
        console.log(JSON.stringify(action)+"+++++++++++++++++++_")
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
        let userInformation = {
          name: profile.displayName,
          email: profile.email,
          profileImage: profile.picture,
          emailAuth: true,
          joinDate: Date.now(),
        };
        // Save the new user data to the database
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

// signup strategy end

// passport.use(
//   "google-login",
//   new GoogleStrategy(
//     {
//       clientID: process.env.LOGIN_CLIENT_ID,
//       clientSecret: process.env.LOGIN_SECRET_ID,
//       callbackURL: "http://localhost:5001/auth/google/login/callback",
//       passReqToCallback: true,
//     },
//     async function(request,accessToken,refreshToken,profile,done){
//       console.log('reached')
//       let userDat=await UserCollection.find({email:profile.email})
//       if(userDat.length>0){
//         done(null,profile)
//       }else{
//         return done(null,false,{message:"User not Found"})
//       }
//     }
//   )
// )