import "dart:convert";
import "package:better_auth_flutter/src/core/enums/social_providers.dart";

class SocialSignIn {
  final SocialProvider provider;
  final String idToken;

  const SocialSignIn({required this.provider, required this.idToken});

  SocialSignIn copyWith({SocialProvider? provider, String? idToken}) {
    return SocialSignIn(
      provider: provider ?? this.provider,
      idToken: idToken ?? this.idToken,
    );
  }

  Map<String, dynamic> toMap() {
    return <String, dynamic>{"provider": provider.id, "idToken": idToken};
  }

  factory SocialSignIn.fromMap(Map<String, dynamic> map) {
    return SocialSignIn(
      provider: SocialProvider.values.firstWhere(
        (e) => e.id == map["provider"] as String,
      ),
      idToken: map["idToken"] as String,
    );
  }

  String toJson() => json.encode(toMap());

  factory SocialSignIn.fromJson(String source) =>
      SocialSignIn.fromMap(json.decode(source) as Map<String, dynamic>);
}
