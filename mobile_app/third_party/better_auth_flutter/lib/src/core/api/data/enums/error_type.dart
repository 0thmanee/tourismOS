enum BetterAuthError {
  unKnownError,
  unauthorized,
  badRequest,
  userNotFound,
  failedToCreateUser,
  failedToCreateSession,
  failedToUpdateUser,
  failedToGetSession,
  invalidPassword,
  invalidEmail,
  invalidEmailOrPassword,
  socialAccountAlreadyLinked,
  providerNotFound,
  invalidToken,
  idTokenNotSupported,
  failedToGetUserInfo,
  userEmailNotFound,
  emailNotVerified,
  passwordTooShort,
  passwordTooLong,
  userAlreadyExists,
  emailCanNotBeUpdated,
  credentialAccountNotFound,
  sessionExpired,
  failedToUnlinkLastAccount,
  accountNotFound,
  failedToSignOut,
  invalidResponse,
  noGoogleUserFound,
  failedToSendVerificationEmail,
  failedToVerifyEmail,
  failedToDeleteUser,
}

extension BetterAuthErrorMessageExtension on BetterAuthError {
  String get message {
    switch (this) {
      case BetterAuthError.unKnownError:
        return "An unexpected error occurred. Please try again later.";
      case BetterAuthError.unauthorized:
        return "Unauthorized";
      case BetterAuthError.badRequest:
        return "Bad Request";
      case BetterAuthError.userNotFound:
        return "User not found";
      case BetterAuthError.failedToCreateUser:
        return "Failed to create user";
      case BetterAuthError.failedToCreateSession:
        return "Failed to create session";
      case BetterAuthError.failedToUpdateUser:
        return "Failed to update user";
      case BetterAuthError.failedToGetSession:
        return "Failed to get session";
      case BetterAuthError.invalidPassword:
        return "Invalid password";
      case BetterAuthError.invalidEmail:
        return "Invalid email";
      case BetterAuthError.invalidEmailOrPassword:
        return "Invalid email or password";
      case BetterAuthError.socialAccountAlreadyLinked:
        return "Social account already linked";
      case BetterAuthError.providerNotFound:
        return "Provider not found";
      case BetterAuthError.invalidToken:
        return "Invalid token";
      case BetterAuthError.idTokenNotSupported:
        return "id_token not supported";
      case BetterAuthError.failedToGetUserInfo:
        return "Failed to get user info";
      case BetterAuthError.userEmailNotFound:
        return "User email not found";
      case BetterAuthError.emailNotVerified:
        return "Email not verified";
      case BetterAuthError.passwordTooShort:
        return "Password too short";
      case BetterAuthError.passwordTooLong:
        return "Password too long";
      case BetterAuthError.userAlreadyExists:
        return "User already exists";
      case BetterAuthError.emailCanNotBeUpdated:
        return "Email can not be updated";
      case BetterAuthError.credentialAccountNotFound:
        return "Credential account not found";
      case BetterAuthError.sessionExpired:
        return "Session expired. Re-authenticate to perform this action.";
      case BetterAuthError.failedToUnlinkLastAccount:
        return "You can't unlink your last account";
      case BetterAuthError.accountNotFound:
        return "Account not found";
      case BetterAuthError.failedToSignOut:
        return "Failed to sign out";
      case BetterAuthError.invalidResponse:
        return "Invalid response";
      case BetterAuthError.noGoogleUserFound:
        return "No Google user found.";
      case BetterAuthError.failedToSendVerificationEmail:
        return "Failed to send verification email";
      case BetterAuthError.failedToVerifyEmail:
        return "Failed to verify email";
      case BetterAuthError.failedToDeleteUser:
        return "Failed to delete user";
    }
  }
}

extension BetterAuthErrorExtension on BetterAuthError {
  String get code {
    switch (this) {
      case BetterAuthError.unKnownError:
        return "UNKNOWN_ERROR";
      case BetterAuthError.unauthorized:
        return "UNAUTHORIZED";
      case BetterAuthError.badRequest:
        return "BAD_REQUEST";
      case BetterAuthError.userNotFound:
        return "USER_NOT_FOUND";
      case BetterAuthError.failedToCreateUser:
        return "FAILED_TO_CREATE_USER";
      case BetterAuthError.failedToCreateSession:
        return "FAILED_TO_CREATE_SESSION";
      case BetterAuthError.failedToUpdateUser:
        return "FAILED_TO_UPDATE_USER";
      case BetterAuthError.failedToGetSession:
        return "FAILED_TO_GET_SESSION";
      case BetterAuthError.invalidPassword:
        return "INVALID_PASSWORD";
      case BetterAuthError.invalidEmail:
        return "INVALID_EMAIL";
      case BetterAuthError.invalidEmailOrPassword:
        return "INVALID_EMAIL_OR_PASSWORD";
      case BetterAuthError.socialAccountAlreadyLinked:
        return "SOCIAL_ACCOUNT_ALREADY_LINKED";
      case BetterAuthError.providerNotFound:
        return "PROVIDER_NOT_FOUND";
      case BetterAuthError.invalidToken:
        return "INVALID_TOKEN";
      case BetterAuthError.idTokenNotSupported:
        return "ID_TOKEN_NOT_SUPPORTED";
      case BetterAuthError.failedToGetUserInfo:
        return "FAILED_TO_GET_USER_INFO";
      case BetterAuthError.userEmailNotFound:
        return "USER_EMAIL_NOT_FOUND";
      case BetterAuthError.emailNotVerified:
        return "EMAIL_NOT_VERIFIED";
      case BetterAuthError.passwordTooShort:
        return "PASSWORD_TOO_SHORT";
      case BetterAuthError.passwordTooLong:
        return "PASSWORD_TOO_LONG";
      case BetterAuthError.userAlreadyExists:
        return "USER_ALREADY_EXISTS";
      case BetterAuthError.emailCanNotBeUpdated:
        return "EMAIL_CAN_NOT_BE_UPDATED";
      case BetterAuthError.credentialAccountNotFound:
        return "CREDENTIAL_ACCOUNT_NOT_FOUND";
      case BetterAuthError.sessionExpired:
        return "SESSION_EXPIRED";
      case BetterAuthError.failedToUnlinkLastAccount:
        return "FAILED_TO_UNLINK_LAST_ACCOUNT";
      case BetterAuthError.accountNotFound:
        return "ACCOUNT_NOT_FOUND";
      case BetterAuthError.failedToSignOut:
        return "FAILED_TO_SIGN_OUT";
      case BetterAuthError.invalidResponse:
        return "INVALID_RESPONSE";
      case BetterAuthError.noGoogleUserFound:
        return "NO_GOOGLE_USER_FOUND";
      case BetterAuthError.failedToSendVerificationEmail:
        return "FAILED_TO_SEND_VERIFICATION_EMAIL";
      case BetterAuthError.failedToVerifyEmail:
        return "FAILED_TO_VERIFY_EMAIL";
      case BetterAuthError.failedToDeleteUser:
        return "FAILED_TO_DELETE_USER";
    }
  }
}
