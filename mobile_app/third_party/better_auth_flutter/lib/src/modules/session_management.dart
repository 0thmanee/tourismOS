import "dart:async";
import "dart:developer";
import "package:better_auth_flutter/src/core/api/api.dart";
import "package:better_auth_flutter/src/core/api/data/enums/error_type.dart";
import "package:better_auth_flutter/src/core/api/data/enums/method_type.dart";
import "package:better_auth_flutter/src/core/api/data/models/api_failure.dart";
import "package:better_auth_flutter/src/core/api/data/models/session.dart";
import "package:better_auth_flutter/src/core/api/data/models/user.dart";
import "package:better_auth_flutter/src/core/constants/app_endpoints.dart";
import "../core/local_storage/kv_store.dart";
import "../core/local_storage/kv_store_keys.dart";

class SessionManagement {
  static Timer? _refreshTimer;

  static Future<((Session?, User?)?, BetterAuthFailure?)> getSession() async {
    try {
      final (result, error) = await Api.sendRequest(
        AppEndpoints.getSession,
        method: MethodType.get,
      );

      if (error != null) return (null, error);

      if (result is! Map<String, dynamic>) {
        return (null, BetterAuthFailure(code: BetterAuthError.invalidResponse));
      }

      final session = Session.fromMap(
        result["session"] as Map<String, dynamic>,
      );
      final user = User.fromMap(result["user"] as Map<String, dynamic>);

      if (session.expiresAt.isBefore(DateTime.now())) {
        return (
          null,
          BetterAuthFailure(
            code: BetterAuthError.sessionExpired,
            message: "Session expired",
          ),
        );
      }

      await KVStore.set(KVStoreKeys.user, user.toJson());
      await KVStore.set(KVStoreKeys.session, session.toJson());

      return ((session, user), null);
    } catch (e) {
      return (
        null,
        BetterAuthFailure(
          code: BetterAuthError.unKnownError,
          message: e.toString(),
        ),
      );
    }
  }

  static void refreshSession(Session session) async {
    // Refresh only when the current session is **expired**.
    final isSessionExpired = session.expiresAt.isBefore(DateTime.now());

    // Nothing to do if the session is still valid.
    if (!isSessionExpired) return;

    final (result, error) = await getSession();

    if (error != null || result == null) {
      final erroMessage = error?.message ?? "server returned null";
      throw Exception("Failed to refresh session: $erroMessage");
    }

    final (newSession, user) = result;

    final shouldStartAutoRefreshTicker =
        newSession != null &&
        newSession.expiresAt.isAfter(DateTime.now()) &&
        newSession.expiresAt.difference(DateTime.now()).inHours < 5;

    if (shouldStartAutoRefreshTicker) {
      startAutoRefreshTicker();
    }
  }

  static void startAutoRefreshTicker() {
    // Ensure there's only ever a single active timer
    _refreshTimer?.cancel();

    _refreshTimer = Timer.periodic(const Duration(hours: 1), (timer) async {
      try {
        final (result, error) = await getSession();
        if (error != null) {
          log("Auto refresh failed: ${error.message}");
        }
      } catch (e) {
        log("Auto refresh error: $e");
      }
    });
  }

  static void stopAutoRefreshTicker() {
    _refreshTimer?.cancel();
    _refreshTimer = null;
  }
}
