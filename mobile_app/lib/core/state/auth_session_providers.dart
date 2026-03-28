import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/auth_session_controller.dart';

final authSessionControllerProvider =
    ChangeNotifierProvider<AuthSessionController>(
  (ref) => AuthSessionController(ref),
);
