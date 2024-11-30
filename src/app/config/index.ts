import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join((process.cwd(), ".env")) });

export default {
  NODE_ENV: process.env.NODE_ENV,
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  default_user_pass: process.env.DEFAULT_USER_PASS,
  bycrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  resetlink: process.env.RESET_LINK,
  email: "fk",
  appPass: "fidj",
};
