const appError = require("../../utils/errors/errors");
const {
  isValidPassword,
} = require("../../utils/validators/password.validator");

class RegisterAdminRequestDTO {
  constructor(payload = {}) {
    this.name = payload.name?.trim();
    this.email = payload.email?.trim().toLowerCase();
    this.password = payload.password;
  }

  validate() {
    if (!this.name) {
      throw new appError.BadRequestError(
        "Name is required",
        "The admin registration request is missing the name field.",
        "Provide a valid name and try again.",
      );
    }

    if (!this.email) {
      throw new appError.BadRequestError(
        "Email is required",
        "The admin registration request is missing the email field.",
        "Provide a valid email and try again.",
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new appError.BadRequestError(
        "Invalid email format",
        "The email provided is not in a valid format.",
        "Use a valid email address (e.g. admin@example.com).",
      );
    }

    if (!this.password) {
      throw new appError.BadRequestError(
        "Password is required",
        "The admin registration request is missing the password field.",
        "Provide a password and try again.",
      );
    }

    if (!isValidPassword(this.password)) {
      throw new appError.BadRequestError(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.",
        "Invalid password format.",
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character(@#$!%*?&).",
      );
    }
  }
}

class LoginAdminRequestDTO {
  constructor(payload = {}) {
    this.email = payload.email?.trim().toLowerCase();
    this.password = payload.password;
  }

  validate() {
    if (!this.email) {
      throw new appError.BadRequestError(
        "Email is required",
        "The admin login request is missing the email field.",
        "Provide a valid email and try again.",
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new appError.BadRequestError(
        "Invalid email format",
        "The email provided is not in a valid format.",
        "Use a valid email address (e.g. admin@example.com).",
      );
    }

    if (!this.password) {
      throw new appError.BadRequestError(
        "Password is required",
        "The admin login request is missing the password field.",
        "Provide the password and try again.",
      );
    }
    if (!isValidPassword(this.password)) {
      throw new appError.BadRequestError(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.",
        "Invalid password format.",
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character(@#$!%*?&).",
      );
    }
  }
}

module.exports = {
  RegisterAdminRequestDTO,
  LoginAdminRequestDTO,
};
