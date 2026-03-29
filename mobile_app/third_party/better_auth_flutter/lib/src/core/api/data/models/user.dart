import "dart:convert";

class User {
  final String id;
  final String email;
  final String name;
  final String? image;
  final bool emailVerified;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.email,
    required this.name,
    this.image,
    required this.emailVerified,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      "id": id,
      "email": email,
      "name": name,
      "image": image,
      "emailVerified": emailVerified,
      "createdAt": createdAt.toIso8601String(),
      "updatedAt": updatedAt.toIso8601String(),
    };
  }

  factory User.fromMap(Map<String, dynamic> map) {
    return User(
      id: map["id"] as String,
      email: map["email"] as String,
      name: map["name"] as String,
      image: map["image"] != null ? map["image"] as String : null,
      emailVerified: map["emailVerified"] as bool,
      createdAt: DateTime.parse(map["createdAt"] as String),
      updatedAt: DateTime.parse(map["updatedAt"] as String),
    );
  }

  String toJson() => json.encode(toMap());

  factory User.fromJson(String source) =>
      User.fromMap(json.decode(source) as Map<String, dynamic>);
}
