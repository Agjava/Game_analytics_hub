const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('./user.model');

// JWT options
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

// Configure Passport
module.exports = () => {
  // JWT Strategy for API authentication
  passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
      try {
        const user = await User.findById(payload.id);
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    })
  );

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:5001/api/auth/google/callback'  // Use full backend URL
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log('Google OAuth Callback - Profile:', profile);
        try {
          // Check if user already exists
          let user = await User.findOne({ 
            providerId: profile.id,
            authProvider: 'google'
          });

          if (user) {
            console.log('Google OAuth Callback - Existing user found:', user);
            // Update last login
            user.lastLogin = Date.now();
            await user.save();
            return done(null, user);
          }

          // Create new user
          console.log('Google OAuth Callback - No existing user, creating new...');
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            authProvider: 'google',
            providerId: profile.id,
            profilePicture: profile.photos[0].value
          });

          await user.save();
          console.log('Google OAuth Callback - New user created:', user);
          return done(null, user);
        } catch (error) {
          console.error('Google OAuth Callback - Error during user processing:', error);
          return done(error, false);
        }
      }
    )
  );

  // GitHub OAuth Strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/api/auth/github/callback',
        scope: ['user:email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ 
            providerId: profile.id,
            authProvider: 'github'
          });

          if (user) {
            // Update last login
            user.lastLogin = Date.now();
            await user.save();
            return done(null, user);
          }

          // Get primary email
          const email = profile.emails && profile.emails[0].value;
          
          if (!email) {
            return done(new Error('Email not available from GitHub'), false);
          }

          // Create new user
          user = new User({
            name: profile.displayName || profile.username,
            email: email,
            authProvider: 'github',
            providerId: profile.id,
            profilePicture: profile.photos && profile.photos[0].value
          });

          await user.save();
          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // Serialize and deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
