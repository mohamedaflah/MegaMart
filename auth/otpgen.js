const speakeasy = require("speakeasy");
function generateOTP() {
  const secret = speakeasy.generateSecret({ length: 6 });
  const code = speakeasy.totp({
    secret: secret.base32,
    encoding: "base32",
  });
  return code;
}
module.exports = { generateOTP };
