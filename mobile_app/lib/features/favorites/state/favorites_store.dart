import 'package:flutter_riverpod/flutter_riverpod.dart';

final favoritesStoreProvider =
    StateNotifierProvider<FavoritesStore, Set<String>>((ref) => FavoritesStore());

class FavoritesStore extends StateNotifier<Set<String>> {
  FavoritesStore() : super(<String>{});

  bool isSaved(String experienceId) => state.contains(experienceId);

  void toggle(String experienceId) {
    final next = Set<String>.from(state);
    if (next.contains(experienceId)) {
      next.remove(experienceId);
    } else {
      next.add(experienceId);
    }
    state = next;
  }
}
