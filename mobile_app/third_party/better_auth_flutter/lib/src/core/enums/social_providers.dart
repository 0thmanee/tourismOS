enum SocialProvider {
  apple,
  discord,
  facebook,
  github,
  google,
  linkedin,
  microsoft,
  spotify,
  twitch,
  x,
}

extension SocialProviderId on SocialProvider {
  String get id {
    switch (this) {
      case SocialProvider.apple:
        return "apple";
      case SocialProvider.discord:
        return "discord";
      case SocialProvider.facebook:
        return "facebook";
      case SocialProvider.github:
        return "github";
      case SocialProvider.google:
        return "google";
      case SocialProvider.linkedin:
        return "linkedin";
      case SocialProvider.microsoft:
        return "microsoft";
      case SocialProvider.spotify:
        return "spotify";
      case SocialProvider.twitch:
        return "twitch";
      case SocialProvider.x:
        return "twitter";
    }
  }
}
