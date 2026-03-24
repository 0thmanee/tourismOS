import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/config/app_env.dart';
import '../../experience_detail/data/experience_detail_mock.dart';
import '../data/experience_dto_mapper.dart';
import '../data/experience_mock_mapper.dart';
import '../domain/experience.dart';
import 'experiences_providers.dart';
import 'marketplace_catalog_state.dart';

List<String> _stringListFromJson(dynamic v) {
  if (v is! List) return [];
  return v.whereType<String>().toList();
}

List<Map<String, dynamic>> _itemMapsFromBody(Map<String, dynamic> body) {
  final items = body['items'];
  if (items is! List) return [];
  return items.whereType<Map<String, dynamic>>().toList();
}

MarketplaceCatalogState _stateFromExperiences(List<Experience> items) {
  final cities =
      items.map((e) => e.city).where((c) => c.trim().isNotEmpty).toSet().toList()
        ..sort();
  final cats = items
      .map((e) => e.category)
      .where((c) => c.trim().isNotEmpty)
      .toSet()
      .toList()
    ..sort();
  return MarketplaceCatalogState(
    items: items,
    availableCities: cities,
    availableCategories: cats,
  );
}

/// Shared catalog for Home + Explore (`meta` when remote; derived facets when mock).
final marketplaceCatalogProvider =
    FutureProvider<MarketplaceCatalogState>((ref) async {
  if (!AppEnv.useRemoteCatalog) {
    return _stateFromExperiences(buildMockMarketplaceCatalog());
  }
  final body = await ref.read(experiencesApiProvider).listExperiencesResponse(
        page: 1,
        pageSize: 48,
      );
  final rawItems = _itemMapsFromBody(body);
  final items = rawItems.map(experienceFromApiDto).toList();
  final derived = _stateFromExperiences(items);
  final meta = body['meta'];
  final metaMap = meta is Map<String, dynamic> ? meta : <String, dynamic>{};
  final apiCities = _stringListFromJson(metaMap['availableCities']);
  final apiCats = _stringListFromJson(metaMap['availableCategories']);
  return MarketplaceCatalogState(
    items: items,
    availableCities: apiCities.isNotEmpty ? apiCities : derived.availableCities,
    availableCategories: apiCats.isNotEmpty ? apiCats : derived.availableCategories,
  );
});

final experienceDetailProvider =
    FutureProvider.autoDispose.family<Experience, String>((ref, id) async {
  if (!AppEnv.useRemoteCatalog && !AppEnv.useRemoteBooking) {
    final mock = ExperienceDetailMock.get(id);
    return experienceFromDetailMock(mock);
  }
  final item = await ref.read(experiencesApiProvider).fetchExperienceItem(id);
  return experienceFromApiDto(item);
});
