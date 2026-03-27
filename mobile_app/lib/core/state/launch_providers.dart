import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/auth_orchestrator.dart';
import 'launch_controller.dart';

final launchControllerProvider = ChangeNotifierProvider<LaunchController>(
  (ref) => LaunchController(),
);

final authOrchestratorProvider = ChangeNotifierProvider<AuthOrchestrator>(
  (ref) => AuthOrchestrator(),
);
