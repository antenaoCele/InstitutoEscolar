import passport from "passport";

export const authentication = passport.authenticate("jwt", {
  session: false,
});

export const authorization = (role) => {
  return (req, res, next) => {
    if (!req.user.role || req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Usuario no autorizado",
      });
    }

    next();
  };
};
