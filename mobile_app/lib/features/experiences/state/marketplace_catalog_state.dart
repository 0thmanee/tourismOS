import '../domain/experience.dart';

class MarketplaceCatalogState {
  const MarketplaceCatalogState({
    required this.items,
    required this.availableCities,
    required this.availableCategories,
  });

  final List<Experience> items;
  final List<String> availableCities;
  final List<String> availableCategories;
}
