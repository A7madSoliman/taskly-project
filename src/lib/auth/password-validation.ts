export const checkPasswordLength = (pwd: string): boolean =>
  pwd.length >= 8 && pwd.length <= 64;

export const checkPasswordComplexity = (pwd: string): boolean =>
  /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd);

export const checkPasswordSpecial = (pwd: string): boolean =>
  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);

export const checkPasswordNoSpaces = (pwd: string): boolean => !/\s/.test(pwd);

export const validatePassword = (password: string): string => {
  if (!password) return "Password is required.";
  if (!checkPasswordLength(password))
    return "Password must be 8-64 characters.";
  if (!checkPasswordNoSpaces(password))
    return "Password must not contain spaces.";
  if (!checkPasswordComplexity(password))
    return "One uppercase, lowercase, and digit required.";
  if (!checkPasswordSpecial(password)) return "One special character required.";
  return "";
};
