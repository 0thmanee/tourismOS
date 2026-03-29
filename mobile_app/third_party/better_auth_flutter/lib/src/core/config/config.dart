class Config {
  static String? _scheme;
  static String? _host;
  static int? _port;

  static String get scheme {
    if (_scheme == null) {
      throw Exception(
        "Better Auth not initialized correctly (scheme missing).",
      );
    }
    return _scheme!;
  }

  static String get host {
    if (_host == null) {
      throw Exception("Better Auth not initialized correctly (host missing).");
    }
    return _host!;
  }

  static int? get port {
    return _port;
  }

  static void initialize({required Uri uri}) {
    _scheme = uri.scheme;
    _host = uri.host;
    _port = uri.port;
  }
}
