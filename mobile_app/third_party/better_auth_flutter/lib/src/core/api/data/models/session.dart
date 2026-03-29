import "dart:convert";

class Session {
  final String id;
  final DateTime expiresAt;
  final String token;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String ipAddress;
  final String userAgent;
  final String userId;

  Session({
    required this.id,
    required this.expiresAt,
    required this.token,
    required this.createdAt,
    required this.updatedAt,
    required this.ipAddress,
    required this.userAgent,
    required this.userId,
  });

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      "id": id,
      "expiresAt": expiresAt.millisecondsSinceEpoch,
      "token": token,
      "createdAt": createdAt.toIso8601String(),
      "updatedAt": updatedAt.toIso8601String(),
      "ipAddress": ipAddress,
      "userAgent": userAgent,
      "userId": userId,
    };
  }

  factory Session.fromMap(Map<String, dynamic> map) {
    return Session(
      id: map["id"] as String,
      expiresAt:
          map["expiresAt"] is String
              ? DateTime.parse(map["expiresAt"] as String)
              : DateTime.fromMillisecondsSinceEpoch(map["expiresAt"] as int),
      token: map["token"] as String,
      createdAt: DateTime.parse(map["createdAt"] as String),
      updatedAt: DateTime.parse(map["updatedAt"] as String),
      ipAddress: map["ipAddress"] as String,
      userAgent: map["userAgent"] as String,
      userId: map["userId"] as String,
    );
  }

  String toJson() => json.encode(toMap());

  factory Session.fromJson(String source) =>
      Session.fromMap(json.decode(source) as Map<String, dynamic>);
}
