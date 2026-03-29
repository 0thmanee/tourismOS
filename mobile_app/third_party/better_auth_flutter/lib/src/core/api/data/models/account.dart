import "dart:convert";

class Account {
  final String id;
  final String provider;
  final DateTime createdAt;
  final DateTime updatedAt;

  Account({
    required this.id,
    required this.provider,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      "id": id,
      "provider": provider,
      "created_at": createdAt.toIso8601String(),
      "updated_at": updatedAt.toIso8601String(),
    };
  }

  factory Account.fromMap(Map<String, dynamic> map) {
    return Account(
      id: map["id"] as String,
      provider: map["provider"] as String,
      createdAt: DateTime.parse(map["created_at"] as String),
      updatedAt: DateTime.parse(map["updated_at"] as String),
    );
  }

  factory Account.fromJson(String source) =>
      Account.fromMap(json.decode(source) as Map<String, dynamic>);
}
