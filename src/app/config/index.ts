import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join((process.cwd(), ".env")) });

export default {
  NODE_ENV: process.env.NODE_ENV,
  front_end_url:
    process?.env?.NODE_ENV == "development"
      ? process.env.FRONT_END_DEV_URL
      : process.env.FRONT_END_PROD_URL,
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
  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  google_client_id: process.env.GOOGLE_CLIENT_ID,
};
