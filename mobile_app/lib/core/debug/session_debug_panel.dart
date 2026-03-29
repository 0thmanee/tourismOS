import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/auth_backend_api.dart';
import '../auth/better_auth_sync.dart';
import '../state/launch_providers.dart';

/// Dev-only session inspector (Profile). Never prints full tokens.
class SessionDebugPanel extends ConsumerStatefulWidget {
  const SessionDebugPanel({super.key});

  @override
  ConsumerState<SessionDebugPanel> createState() => _SessionDebugPanelState();
}

class _SessionDebugPanelState extends ConsumerState<SessionDebugPanel> {
  bool _probing = false;
  String? _serverLine;

  Future<void> _pingServer() async {
    setState(() {
      _probing = true;
      _serverLine = null;
    });
    try {
      final ok = await AuthBackendApi.hasServerSession();
      if (!mounted) return;
      setState(() {
        _serverLine = ok
            ? 'GET /v1/auth/session → authenticated'
            : 'GET /v1/auth/session → not authenticated (check body / token)';
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _serverLine = 'GET /v1/auth/session → error: $e');
    } finally {
      if (mounted) setState(() => _probing = false);
    }
  }

  Future<void> _refreshClient() async {
    await refreshBetterAuthClientSession();
    if (mounted) setState(() {});
  }

  Future<void> _reconcilePrefs() async {
    final launch = ref.read(launchControllerProvider);
    await applyLaunchPrefsFromBetterAuth(launch);
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    if (!kDebugMode) return const SizedBox.shrink();

    ref.watch(launchControllerProvider);
    ref.watch(authSessionControllerProvider);

    final launch = ref.read(launchControllerProvider);
    final auth = ref.read(authSessionControllerProvider);
    final session = BetterAuth.instance.client.session;
    final user = BetterAuth.instance.client.user;
    final tok = session?.token;

    final tokenLine = tok == null || tok.isEmpty
        ? 'missing'
        : 'present, ${tok.length} chars (not shown)';

    final userLine = user == null
        ? 'null'
        : '${user.email} · id ${user.id.length > 8 ? '${user.id.substring(0, 8)}…' : user.id}';

    final cs = Theme.of(context).colorScheme;
    final mono = Theme.of(context).textTheme.bodySmall?.copyWith(
          fontFamily: 'monospace',
          fontSize: 11,
        );

    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: cs.outlineVariant),
        color: cs.errorContainer.withValues(alpha: 0.12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.bug_report_rounded, size: 18, color: cs.primary),
              const SizedBox(width: 8),
              Text(
                'Session debug (dev)',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          _row('authStatus', auth.authStatus.name, mono),
          _row('sessionReady', '${launch.sessionReady}', mono),
          _row('isGuest', '${launch.isGuest}', mono),
          _row('hasCheckedSession', '${auth.hasCheckedSession}', mono),
          _row('isBootstrapping', '${auth.isBootstrapping}', mono),
          _row('BetterAuth user', userLine, mono),
          _row('session.id', session?.id ?? '—', mono),
          _row('Bearer token', tokenLine, mono),
          if (_serverLine != null) ...[
            const SizedBox(height: 6),
            Text(_serverLine!, style: mono),
          ],
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              FilledButton.tonal(
                onPressed: _probing ? null : _pingServer,
                child: Text(_probing ? '…' : 'Ping /v1/auth/session'),
              ),
              OutlinedButton(
                onPressed: _refreshClient,
                child: const Text('Refresh client'),
              ),
              OutlinedButton(
                onPressed: _reconcilePrefs,
                child: const Text('Apply launch prefs'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _row(String k, String v, TextStyle? style) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Text('$k: $v', style: style),
    );
  }
}
