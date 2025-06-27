module.exports = {
  // Extend the default create-react-app configuration
  extends: ['react-app', 'react-app/jest'],
  // Define global variables that ESLint should recognize
  // This prevents 'no-undef' errors for variables provided by the environment.
  globals: {
    __app_id: true,
    __initial_auth_token: true,
  },
  rules: {
    // You can add custom rules here if needed.
    // For example, to completely disable the no-undef rule (not recommended):
    // 'no-undef': 'off',
  },
};
