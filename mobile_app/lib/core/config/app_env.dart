class AppEnv {
  // Pass at runtime:
  // flutter run --dart-define=API_BASE_URL=http://localhost:3000/api
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api',
  );
}
