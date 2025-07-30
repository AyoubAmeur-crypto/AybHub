const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy
const User = require("../models/User"); 
require("dotenv").config()
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;
      const existingUser = await User.findOne({ email });

      if (existingUser) return done(null, existingUser);

      const newUser = await User.create({
        googleId:profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: email,
        avatar: profile.photos[0].value,
        password: undefined,
        provider:'google'
      });

      return done(null, newUser);
    }
  )
);
passport.use(new FacebookStrategy(

  {   clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ['id', 'emails', 'name', 'picture.type(large)']
    
    
    }, async (accesstoke,refreshtoke,profile,done) => {
          
        const email = profile.emails?.[0]?.value;
        const existingUser = await User.findOne({email:email})
        if(existingUser) {

          return done(null,existingUser)
        }

        const newUser = await User.create({
        facebookId:profile.id,
        firstName: profile?.name?.givenName,
        lastName: profile?.name?.familyName,
        email: email,
        avatar: profile.photos?.[0]?.value,
        password: undefined,
        provider:'facebook'

        })

        return done(null,newUser)
      }
))
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
