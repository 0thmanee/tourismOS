import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../state/launch_providers.dart';

/// Main app chrome: optional back, title, profile avatar on the right.
class AppMainAppBar extends StatelessWidget implements PreferredSizeWidget {
  const AppMainAppBar({
    super.key,
    required this.title,
    this.showBack,
    this.actions,
    this.onBackPressed,
    this.onBackFallback,
  });

  final Widget title;
  final bool? showBack;
  final List<Widget>? actions;

  /// When set, replaces default back (pop / [onBackFallback]).
  final VoidCallback? onBackPressed;

  /// Used when back is shown but [context.canPop] is false (e.g. cold deep link).
  final VoidCallback? onBackFallback;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return Consumer(
      builder: (context, ref, _) {
        final effectiveBack = showBack ?? context.canPop();
        return AppBar(
          automaticallyImplyLeading: false,
          leading: effectiveBack
              ? IconButton(
                  icon: const Icon(Icons.arrow_back_rounded),
                  tooltip: 'Back',
                  onPressed: onBackPressed ??
                      () {
                        if (context.canPop()) {
                          context.pop();
                        } else if (onBackFallback != null) {
                          onBackFallback!();
                        }
                      },
                )
              : null,
          title: title,
          centerTitle: false,
          actions: [
            ...?actions,
            const AppProfileAvatarButton(),
          ],
        );
      },
    );
  }
}

/// Opens `/app/profile` — avatar from session when signed in, placeholder when guest.
class AppProfileAvatarButton extends ConsumerWidget {
  const AppProfileAvatarButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final launch = ref.watch(launchControllerProvider);
    final user = BetterAuth.instance.client.user;
    final signedIn = launch.sessionReady && !launch.isGuest && user != null;
    final url = user?.image?.trim();
    final name = user?.name.trim() ?? '';

    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: IconButton(
        onPressed: () => context.go('/app/profile'),
        tooltip: 'Profile',
        icon: CircleAvatar(
          radius: 18,
          backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest,
          foregroundImage: signedIn && url != null && url.isNotEmpty
              ? NetworkImage(url)
              : null,
          child: !signedIn
              ? Icon(
                  Icons.person_outline_rounded,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                )
              : (url == null || url.isEmpty)
                  ? Text(
                      name.isNotEmpty
                          ? name.substring(0, 1).toUpperCase()
                          : '?',
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    )
                  : null,
        ),
      ),
    );
  }
}
