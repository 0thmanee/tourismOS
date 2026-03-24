/// Safe coercion for loosely typed JSON/map values (API + mock maps).
int readInt(dynamic v, [int fallback = 0]) {
  if (v is int) return v;
  if (v is num) return v.round();
  return fallback;
}
