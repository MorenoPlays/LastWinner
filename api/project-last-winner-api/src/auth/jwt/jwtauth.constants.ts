export const jwtConstants = {
  secret:
    process.env.JWT_SECRET ||
    'lastwinner_super_secret_key_change_in_production',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
};
