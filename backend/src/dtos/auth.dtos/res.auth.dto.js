class AuthResponseDTO {
  constructor({ user, accessToken }) {
    this.user = {
      id: user._id?.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    this.accessToken = accessToken;
  }
}

module.exports = {
  AuthResponseDTO,
};