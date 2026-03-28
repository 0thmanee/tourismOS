import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'launch_controller.dart';

final launchControllerProvider = ChangeNotifierProvider<LaunchController>(
  (ref) => LaunchController(),
);
