import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../data/experiences_api.dart';

final experiencesApiProvider = Provider<ExperiencesApi>((ref) {
  return ExperiencesApi(ref.watch(dioProvider));
});

final featuredExperiencesProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  return ref.watch(experiencesApiProvider).listFeatured();
});
