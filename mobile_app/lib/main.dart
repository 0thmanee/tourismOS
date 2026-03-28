import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'core/data/app_mock_data.dart';
import 'core/config/app_env.dart';
import 'core/routing/app_router.dart';
import 'core/state/launch_providers.dart';
import 'core/theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await BetterAuth.init(baseUrl: AppEnv.betterAuthBaseUri);
  runApp(const ProviderScope(child: MoroccoExperiencesApp()));
}

class MoroccoExperiencesApp extends ConsumerStatefulWidget {
  const MoroccoExperiencesApp({super.key});

  @override
  ConsumerState<MoroccoExperiencesApp> createState() =>
      _MoroccoExperiencesAppState();
}

class _MoroccoExperiencesAppState extends ConsumerState<MoroccoExperiencesApp> {
  /// Must be a single instance for the app lifetime — never recreate on rebuild.
  GoRouter? _router;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(authSessionControllerProvider).bootstrap();
    });
  }

  @override
  Widget build(BuildContext context) {
    final launch = ref.read(launchControllerProvider);
    final auth = ref.read(authSessionControllerProvider);
    _router ??= createAppRouter(launch, auth);

    return MaterialApp.router(
      title: AppMockData.appBrandName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      routerConfig: _router!,
    );
  }
}
