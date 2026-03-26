class AppEnv {
  // Pass at runtime:
  // flutter run --dart-define=API_BASE_URL=http://localhost:3000/api
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api',
  );

  /// Google OAuth **Web client ID** (the client that can verify ID tokens on your backend).
  /// Must match the OAuth client that issued the ID token from `google_sign_in`.
  ///
  /// flutter run --dart-define=GOOGLE_SERVER_CLIENT_ID=xxxx.apps.googleusercontent.com
  static const googleServerClientId = String.fromEnvironment(
    'GOOGLE_SERVER_CLIENT_ID',
    defaultValue: '',
  );

  /// Origin only (scheme + host + port). `better_auth_flutter` appends `/api/auth/...` itself.
  static Uri get betterAuthBaseUri {
    final api = Uri.parse(apiBaseUrl);
    return Uri(
      scheme: api.scheme,
      host: api.host,
      port: api.hasPort ? api.port : null,
    );
  }

  /// When true, Home / Explore / Detail load catalog from `GET /api/v1/experiences*`.
  /// Default false keeps mock data (safe for demos without a backend).
  ///
  /// When true, the booking wizard also loads the same experience via API (aligned with
  /// detail). `USE_REMOTE_BOOKING` alone still triggers API load for booking when catalog is off.
  static const useRemoteCatalog = bool.fromEnvironment(
    'USE_REMOTE_CATALOG',
    defaultValue: false,
  );

  /// When true, booking submits `POST /api/v1/bookings` and confirmation uses the response `trip`.
  /// Does not control whether the wizard loads catalog data: use with [useRemoteCatalog] or alone.
  static const useRemoteBooking = bool.fromEnvironment(
    'USE_REMOTE_BOOKING',
    defaultValue: false,
  );

  /// When true, Trips list/detail load from `GET /api/v1/trips*` (requires `phone` query — see docs).
  /// Expect server-backed bookings; mock-only trips are replaced on load.
  static const useRemoteTrips = bool.fromEnvironment(
    'USE_REMOTE_TRIPS',
    defaultValue: false,
  );
}
