import '../domain/experience.dart';

/// When API-backed, reuse one catalog load for themed rows (editorial titles, real ids).
List<Experience> experiencesForCuratedSection(
  List<Experience> all,
  String sectionTitle,
) {
  if (all.isEmpty) return const [];

  bool hasDesert(Experience e) {
    final t = '${e.title} ${e.category}'.toLowerCase();
    return t.contains('desert') || t.contains('agafay') || t.contains('camel');
  }

  bool hasFood(Experience e) {
    final t = '${e.title} ${e.category}'.toLowerCase();
    return t.contains('food') || t.contains('dinner') || t.contains('cooking');
  }

  switch (sectionTitle) {
    case 'Best in Marrakech':
      final m =
          all.where((e) => e.city.toLowerCase().contains('marrakech')).toList();
      return (m.length >= 2 ? m : all).take(8).toList();
    case 'Desert escapes':
      final d = all.where(hasDesert).toList();
      return (d.length >= 2 ? d : all).take(8).toList();
    case 'Authentic food':
      final f = all.where(hasFood).toList();
      return (f.length >= 2 ? f : all).take(8).toList();
    default:
      return all.take(6).toList();
  }
}
