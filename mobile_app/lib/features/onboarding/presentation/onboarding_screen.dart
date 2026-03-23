import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/state/launch_providers.dart';
import '../../../core/theme/app_tokens.dart';

/// Onboarding: 3 value slides + optional personalization (interests, language, city).
///
/// UX: one message per screen; Skip always visible; no account creation here.
class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _pageController = PageController();
  int _page = 0;

  final _interestOptions = const [
    'Culture',
    'Adventure',
    'Food',
    'Surf',
    'Nature',
    'Luxury',
  ];

  final _cityOptions = const [
    'Marrakech',
    'Taghazout',
    'Fes',
    'Essaouira',
    'Agadir',
  ];

  final Set<String> _interests = {};
  String? _city;
  String _language = 'en';

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _finishOnboarding({required bool includePersonalization}) async {
    final launch = ref.read(launchControllerProvider);
    if (includePersonalization) {
      await launch.savePersonalization(
        interests: _interests.toList(),
        cityCode: _city,
        languageCode: _language,
      );
    }
    await launch.setOnboardingCompleted();
    if (!mounted) return;
    context.go('/auth');
  }

  void _onSkip() {
    if (_page < 2) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 280),
        curve: Curves.easeOutCubic,
      );
    } else if (_page == 2) {
      // Skip personalization entirely.
      _finishOnboarding(includePersonalization: false);
    } else {
      _finishOnboarding(includePersonalization: false);
    }
  }

  void _onContinue() {
    if (_page < 2) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 280),
        curve: Curves.easeOutCubic,
      );
    } else if (_page == 2) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 280),
        curve: Curves.easeOutCubic,
      );
    } else {
      _finishOnboarding(includePersonalization: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: _onSkip,
                style: TextButton.styleFrom(
                  textStyle: theme.textTheme.labelLarge?.copyWith(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                child: const Text('Skip'),
              ),
            ),
            Expanded(
              child: PageView(
                controller: _pageController,
                onPageChanged: (i) => setState(() => _page = i),
                children: [
                  _IntroPage(
                    mediaAsset:
                        'assets/images/onboarding/discover_morocco.jpg',
                    title: 'Find authentic experiences across Morocco',
                    subtitle:
                        'Curated activities from trusted local operators — discover what fits you.',
                  ),
                  _IntroPage(
                    mediaAsset:
                        'assets/images/onboarding/book_with_confidence.jpg',
                    title: 'Book with confidence',
                    subtitle:
                        'Clear pricing, transparent details, and a smooth booking flow.',
                  ),
                  _IntroPage(
                    mediaAsset: 'assets/images/onboarding/manage_trip.jpg',
                    title: 'Manage your trip',
                    subtitle:
                        'Keep bookings, times, and status in one calm place.',
                  ),
                  _PersonalizationPage(
                    interestOptions: _interestOptions,
                    cityOptions: _cityOptions,
                    selectedInterests: _interests,
                    onToggleInterest: (v) {
                      setState(() {
                        if (_interests.contains(v)) {
                          _interests.remove(v);
                        } else {
                          _interests.add(v);
                        }
                      });
                    },
                    city: _city,
                    onCity: (c) => setState(() => _city = c),
                    language: _language,
                    onLanguage: (l) => setState(() => _language = l),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(4, (i) {
                  final active = i == _page;
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: active ? 22 : 7,
                    height: 7,
                    decoration: BoxDecoration(
                      color: active
                          ? theme.colorScheme.primary
                          : theme.colorScheme.outlineVariant,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  );
                }),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
              child: SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _onContinue,
                  style: FilledButton.styleFrom(
                    textStyle: theme.textTheme.labelLarge?.copyWith(
                      fontSize: 21,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  child: const Text('Continue'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _IntroPage extends StatelessWidget {
  const _IntroPage({
    required this.mediaAsset,
    required this.title,
    required this.subtitle,
  });

  final String mediaAsset;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Stack(
      fit: StackFit.expand,
      children: [
        Image.asset(
          mediaAsset,
          fit: BoxFit.cover,
          alignment: Alignment.topCenter,
          errorBuilder: (_, __, ___) => Container(
            color: AppTokens.brandPrimary.withValues(alpha: 0.22),
            alignment: Alignment.center,
            child: Icon(
              Icons.image_outlined,
              size: 44,
              color: AppTokens.brandPrimary.withValues(alpha: 0.7),
            ),
          ),
        ),
        DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.black.withValues(alpha: 0.06),
                Colors.black.withValues(alpha: 0.26),
                Colors.black.withValues(alpha: 0.60),
              ],
              stops: const [0.0, 0.55, 1.0],
            ),
          ),
        ),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Align(
              alignment: Alignment.bottomCenter,
              child: Container(
                padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
                decoration: BoxDecoration(
                  color: AppTokens.appSurface.withValues(alpha: 0.93),
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(
                    color: AppTokens.appBorder.withValues(alpha: 0.75),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.14),
                      blurRadius: 20,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      title,
                      textAlign: TextAlign.center,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontSize: 34,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.12,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      subtitle,
                      textAlign: TextAlign.center,
                      maxLines: 4,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.onSurfaceVariant,
                        height: 1.32,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _PersonalizationPage extends StatelessWidget {
  const _PersonalizationPage({
    required this.interestOptions,
    required this.cityOptions,
    required this.selectedInterests,
    required this.onToggleInterest,
    required this.city,
    required this.onCity,
    required this.language,
    required this.onLanguage,
  });

  final List<String> interestOptions;
  final List<String> cityOptions;
  final Set<String> selectedInterests;
  final void Function(String) onToggleInterest;
  final String? city;
  final void Function(String?) onCity;
  final String language;
  final void Function(String) onLanguage;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 8),
          Text(
            'What are you interested in?',
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Optional — pick a few. You can change this later.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: interestOptions.map((label) {
              final selected = selectedInterests.contains(label);
              return FilterChip(
                label: Text(label),
                selected: selected,
                onSelected: (_) => onToggleInterest(label),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),
          Text(
            'Preferred language',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            key: ValueKey(language),
            initialValue: language,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              isDense: true,
            ),
            items: const [
              DropdownMenuItem(value: 'en', child: Text('English')),
              DropdownMenuItem(value: 'fr', child: Text('Français')),
              DropdownMenuItem(value: 'ar', child: Text('العربية')),
            ],
            onChanged: (v) {
              if (v != null) onLanguage(v);
            },
          ),
          const SizedBox(height: 20),
          Text(
            'Destination (optional)',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: cityOptions.map((c) {
              final selected = city == c;
              return ChoiceChip(
                label: Text(c),
                selected: selected,
                onSelected: (_) => onCity(selected ? null : c),
              );
            }).toList(),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
