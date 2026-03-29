import "dart:convert";
import "package:better_auth_flutter/src/core/api/data/enums/error_type.dart";

class BetterAuthFailure {
  final BetterAuthError code;
  final String message;

  BetterAuthFailure({
    required this.code,
    this.message = "An unexpected error occurred. Please try again later.",
  });

  Map<String, dynamic> toMap() {
    return <String, dynamic>{"errorType": code.message, "message": message};
  }

  factory BetterAuthFailure.fromMap(Map<String, dynamic> map) {
    return BetterAuthFailure(
      code: BetterAuthError.values.firstWhere(
        (element) => element.message == map["errorType"],
      ),
      message: map["message"] as String,
    );
  }

  String toJson() => json.encode(toMap());

  factory BetterAuthFailure.fromJson(String source) =>
      BetterAuthFailure.fromMap(json.decode(source) as Map<String, dynamic>);
}
