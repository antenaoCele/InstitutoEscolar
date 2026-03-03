import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

export const configurePassport = () => {
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    new Strategy(jwtOptions, async (payload, done) => {
      return done(null, payload);
    }),
  );
};
