/// Shared phone normalization for B2C APIs (`customer.phone`, `?phone=` on trips).
///
/// Single canonical form for Moroccan numbers: **E.164-style** `+212` plus the
/// national subscriber digits **without** the leading `0` (e.g. `0612345678` →
/// `+212612345678`). Other numbers fall back to `+` plus digits only.
///
/// If there are too few digits (e.g. demo placeholders with `X`), returns mild
/// whitespace/punctuation stripping only so those strings stay usable.
String normalizeB2cPhoneForApi(String raw) {
  final mild = raw
      .trim()
      .replaceAll(RegExp(r'\s+'), '')
      .replaceAll(RegExp(r'[\-\(\)\.]'), '');
  final onlyDigits = mild.replaceAll(RegExp(r'\D'), '');

  if (onlyDigits.isEmpty) {
    return mild;
  }

  if (onlyDigits.startsWith('212')) {
    return '+$onlyDigits';
  }

  if (onlyDigits.length == 10 && onlyDigits.startsWith('0')) {
    return '+212${onlyDigits.substring(1)}';
  }

  if (onlyDigits.length == 9 &&
      (onlyDigits.startsWith('6') || onlyDigits.startsWith('7'))) {
    return '+212$onlyDigits';
  }

  if (onlyDigits.length < 9) {
    return mild;
  }

  if (mild.startsWith('+')) {
    return '+$onlyDigits';
  }
  return '+$onlyDigits';
}
