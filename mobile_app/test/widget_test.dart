import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:morocco_experiences_mobile/features/auth/presentation/auth_screen.dart';

void main() {
  testWidgets('auth screen shows guest path', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(home: AuthScreen()),
      ),
    );
    expect(find.text('Continue as Guest'), findsOneWidget);
  });
}
