import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../experience_detail/data/experience_detail_mock.dart';
import '../../trips/state/trips_store.dart';

class BookingFlowScreen extends ConsumerStatefulWidget {
  const BookingFlowScreen({super.key, required this.experienceId});

  final String experienceId;

  @override
  ConsumerState<BookingFlowScreen> createState() => _BookingFlowScreenState();
}

class _BookingFlowScreenState extends ConsumerState<BookingFlowScreen> {
  static const _steps = [
    'When',
    'Options',
    'Traveler',
    'Review',
    'Payment',
    'Confirm',
  ];

  int _step = 0;
  String _selectedDate = 'Sat, Mar 28';
  String _selectedSlot = '10:30';
  int _guests = 2;
  int _durationDays = 1;
  int _resourceUnits = 1;
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  String _paymentChoice = 'deposit';
  bool _savedToTrips = false;

  @override
  void initState() {
    super.initState();
    _nameCtrl.text = 'Othmane A.';
    _phoneCtrl.text = '+212 6XX XX XX XX';
    _emailCtrl.text = 'traveler@example.com';
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _emailCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final detail = ExperienceDetailMock.get(widget.experienceId);
    final activityType = (detail['activityType'] as String?) ?? 'FIXED_SLOT';
    final bookingMode = (detail['bookingMode'] as String?) ?? 'INSTANT';
    final slots = ((detail['availableSlots'] as List<dynamic>?) ?? ['10:00'])
        .cast<String>();

    if (!slots.contains(_selectedSlot)) {
      _selectedSlot = slots.first;
    }

    final ctaLabel = _step == _steps.length - 1
        ? 'Done'
        : _step == _steps.length - 2
            ? 'Confirm booking'
            : 'Continue';

    return Scaffold(
      appBar: AppBar(
        title: Text(detail['title'] as String),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              LinearProgressIndicator(
                value: (_step + 1) / _steps.length,
                minHeight: 8,
                borderRadius: BorderRadius.circular(999),
              ),
              const SizedBox(height: 10),
              Text(
                'Step ${_step + 1} of ${_steps.length} · ${_steps[_step]}',
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: SingleChildScrollView(
                  child: _buildStep(context, detail, activityType, bookingMode, slots),
                ),
              ),
              const SizedBox(height: 12),
              _BottomSummary(
                priceFromMad: detail['priceFromMad'] as int,
                guests: _guests,
                bookingMode: bookingMode,
                depositMad: (detail['depositMad'] as int?) ?? 0,
                paymentChoice: _paymentChoice,
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  if (_step > 0)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => setState(() => _step -= 1),
                        child: const Text('Back'),
                      ),
                    ),
                  if (_step > 0) const SizedBox(width: 8),
                  Expanded(
                    child: FilledButton(
                      onPressed: () {
                        if (_step < _steps.length - 1) {
                          setState(() => _step += 1);
                        } else {
                          if (!_savedToTrips) {
                            _saveToTrips(detail, activityType, bookingMode);
                            _savedToTrips = true;
                          }
                          Navigator.of(context).pop();
                        }
                      },
                      child: Text(ctaLabel),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStep(
    BuildContext context,
    Map<String, dynamic> detail,
    String activityType,
    String bookingMode,
    List<String> slots,
  ) {
    switch (_step) {
      case 0:
        return _DateStep(
          selectedDate: _selectedDate,
          selectedSlot: _selectedSlot,
          slots: slots,
          showSlot: activityType != 'MULTI_DAY',
          onDateChanged: (value) => setState(() => _selectedDate = value),
          onSlotChanged: (value) => setState(() => _selectedSlot = value),
        );
      case 1:
        return _OptionsStep(
          activityType: activityType,
          bookingMode: bookingMode,
          guests: _guests,
          durationDays: _durationDays,
          resourceUnits: _resourceUnits,
          durationOptions: ((detail['durationOptionsDays'] as List<dynamic>?) ?? [1])
              .cast<int>(),
          onGuestsChanged: (v) => setState(() => _guests = v),
          onDurationChanged: (v) => setState(() => _durationDays = v),
          onResourceUnitsChanged: (v) => setState(() => _resourceUnits = v),
        );
      case 2:
        return _TravelerStep(
          nameCtrl: _nameCtrl,
          phoneCtrl: _phoneCtrl,
          emailCtrl: _emailCtrl,
          notesCtrl: _notesCtrl,
        );
      case 3:
        return _ReviewStep(
          detail: detail,
          selectedDate: _selectedDate,
          selectedSlot: _selectedSlot,
          guests: _guests,
          durationDays: _durationDays,
          resourceUnits: _resourceUnits,
          activityType: activityType,
        );
      case 4:
        return _PaymentStep(
          bookingMode: bookingMode,
          depositRequired: detail['depositRequired'] == true,
          depositMad: (detail['depositMad'] as int?) ?? 0,
          paymentChoice: _paymentChoice,
          onChoiceChanged: (v) => setState(() => _paymentChoice = v),
        );
      default:
        return _ConfirmationStep(
          bookingRef: 'BK-${DateTime.now().millisecondsSinceEpoch % 1000000}',
          title: detail['title'] as String,
          city: detail['city'] as String? ?? '',
          selectedDate: _selectedDate,
          selectedSlot: _selectedSlot,
          bookingMode: bookingMode,
          travelers: _guests,
          meetingPoint: detail['meetingPoint'] as String? ?? '',
          totalMad: (detail['priceFromMad'] as int) * _guests,
        );
    }
  }

  void _saveToTrips(
    Map<String, dynamic> detail,
    String activityType,
    String bookingMode,
  ) {
    final status = bookingMode == 'REQUEST' ? 'Pending' : 'Confirmed';
    final paymentStatus = bookingMode == 'REQUEST'
        ? 'Awaiting confirmation'
        : _paymentChoice == 'later'
            ? 'Pay later'
            : ((detail['depositRequired'] == true) ? 'Deposit paid' : 'Paid');

    final startAt = DateTime.now().add(const Duration(days: 3));
    final bookingId = 'BK-${DateTime.now().millisecondsSinceEpoch % 1000000}';

    ref.read(tripsStoreProvider.notifier).addTrip({
      'bookingId': bookingId,
      'experienceId': widget.experienceId,
      'title': detail['title'] as String,
      'city': detail['city'] as String? ?? '',
      'heroImage': detail['heroImage'] as String? ?? '',
      'status': status,
      'paymentStatus': paymentStatus,
      'bookingType': activityType,
      'operatorName': detail['trustBadge'] as String? ?? 'Local operator',
      'meetingPoint': detail['meetingPoint'] as String? ?? '',
      'travelers': _guests,
      'startAt': startAt.toIso8601String(),
      'timeLabel': _selectedSlot,
      'dateLabel': _selectedDate,
    });
  }
}

class _DateStep extends StatelessWidget {
  const _DateStep({
    required this.selectedDate,
    required this.selectedSlot,
    required this.slots,
    required this.showSlot,
    required this.onDateChanged,
    required this.onSlotChanged,
  });

  final String selectedDate;
  final String selectedSlot;
  final List<String> slots;
  final bool showSlot;
  final ValueChanged<String> onDateChanged;
  final ValueChanged<String> onSlotChanged;

  @override
  Widget build(BuildContext context) {
    const dates = ['Fri, Mar 27', 'Sat, Mar 28', 'Sun, Mar 29', 'Mon, Mar 30'];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Select your date',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w900,
              ),
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: dates
              .map(
                (d) => ChoiceChip(
                  label: Text(d),
                  selected: selectedDate == d,
                  onSelected: (_) => onDateChanged(d),
                ),
              )
              .toList(),
        ),
        if (showSlot) ...[
          const SizedBox(height: 18),
          Text(
            'Choose a time slot',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: slots
                .map(
                  (slot) => ChoiceChip(
                    label: Text(slot),
                    selected: selectedSlot == slot,
                    onSelected: (_) => onSlotChanged(slot),
                  ),
                )
                .toList(),
          ),
        ],
      ],
    );
  }
}

class _OptionsStep extends StatelessWidget {
  const _OptionsStep({
    required this.activityType,
    required this.bookingMode,
    required this.guests,
    required this.durationDays,
    required this.resourceUnits,
    required this.durationOptions,
    required this.onGuestsChanged,
    required this.onDurationChanged,
    required this.onResourceUnitsChanged,
  });

  final String activityType;
  final String bookingMode;
  final int guests;
  final int durationDays;
  final int resourceUnits;
  final List<int> durationOptions;
  final ValueChanged<int> onGuestsChanged;
  final ValueChanged<int> onDurationChanged;
  final ValueChanged<int> onResourceUnitsChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Booking options',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w900,
              ),
        ),
        const SizedBox(height: 8),
        Text(
          bookingMode == 'REQUEST'
              ? 'This experience is request-based. Your host confirms availability after your request.'
              : 'This experience supports instant confirmation after checkout.',
        ),
        const SizedBox(height: 14),
        if (activityType == 'MULTI_DAY')
          DropdownButtonFormField<int>(
            initialValue: durationDays,
            decoration: const InputDecoration(labelText: 'Duration package'),
            items: durationOptions
                .map((d) => DropdownMenuItem(value: d, child: Text('$d day${d > 1 ? 's' : ''}')))
                .toList(),
            onChanged: (v) => onDurationChanged(v ?? 1),
          ),
        if (activityType == 'RESOURCE_BASED')
          DropdownButtonFormField<int>(
            initialValue: resourceUnits,
            decoration: const InputDecoration(labelText: 'Units / vehicles'),
            items: List.generate(
              6,
              (i) => DropdownMenuItem(value: i + 1, child: Text('${i + 1} unit(s)')),
            ),
            onChanged: (v) => onResourceUnitsChanged(v ?? 1),
          ),
        const SizedBox(height: 12),
        DropdownButtonFormField<int>(
          initialValue: guests,
          decoration: const InputDecoration(labelText: 'Travelers'),
          items: List.generate(
            10,
            (i) => DropdownMenuItem(value: i + 1, child: Text('${i + 1} traveler(s)')),
          ),
          onChanged: (v) => onGuestsChanged(v ?? 1),
        ),
      ],
    );
  }
}

class _TravelerStep extends StatelessWidget {
  const _TravelerStep({
    required this.nameCtrl,
    required this.phoneCtrl,
    required this.emailCtrl,
    required this.notesCtrl,
  });

  final TextEditingController nameCtrl;
  final TextEditingController phoneCtrl;
  final TextEditingController emailCtrl;
  final TextEditingController notesCtrl;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(
          controller: nameCtrl,
          decoration: const InputDecoration(labelText: 'Full name'),
        ),
        const SizedBox(height: 10),
        TextField(
          controller: phoneCtrl,
          decoration: const InputDecoration(labelText: 'Phone'),
        ),
        const SizedBox(height: 10),
        TextField(
          controller: emailCtrl,
          decoration: const InputDecoration(labelText: 'Email'),
        ),
        const SizedBox(height: 10),
        TextField(
          controller: notesCtrl,
          maxLines: 3,
          decoration: const InputDecoration(
            labelText: 'Notes (optional)',
            hintText: 'Dietary needs, accessibility, or requests',
          ),
        ),
      ],
    );
  }
}

class _ReviewStep extends StatelessWidget {
  const _ReviewStep({
    required this.detail,
    required this.selectedDate,
    required this.selectedSlot,
    required this.guests,
    required this.durationDays,
    required this.resourceUnits,
    required this.activityType,
  });

  final Map<String, dynamic> detail;
  final String selectedDate;
  final String selectedSlot;
  final int guests;
  final int durationDays;
  final int resourceUnits;
  final String activityType;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Review your booking',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w900,
              ),
        ),
        const SizedBox(height: 10),
        _line('Experience', detail['title'] as String),
        _line('Date', selectedDate),
        _line('Time', selectedSlot),
        _line('Travelers', '$guests'),
        if (activityType == 'MULTI_DAY') _line('Package', '$durationDays day(s)'),
        if (activityType == 'RESOURCE_BASED') _line('Units', '$resourceUnits'),
        _line('Meeting point', detail['meetingPoint'] as String),
        _line('Price from', '${detail['priceFromMad']} MAD'),
      ],
    );
  }

  Widget _line(String key, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 120, child: Text(key)),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}

class _PaymentStep extends StatelessWidget {
  const _PaymentStep({
    required this.bookingMode,
    required this.depositRequired,
    required this.depositMad,
    required this.paymentChoice,
    required this.onChoiceChanged,
  });

  final String bookingMode;
  final bool depositRequired;
  final int depositMad;
  final String paymentChoice;
  final ValueChanged<String> onChoiceChanged;

  @override
  Widget build(BuildContext context) {
    if (bookingMode == 'REQUEST') {
      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: Theme.of(context).colorScheme.surfaceContainerHigh,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Request booking',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
            ),
            const SizedBox(height: 8),
            const Text(
              'No immediate payment. Your request is sent to the operator, then you receive confirmation and next payment instructions.',
            ),
            const SizedBox(height: 10),
            _TrustRow(
              icon: Icons.lock_rounded,
              text: 'Secure request, no card charge now',
            ),
            const SizedBox(height: 6),
            _TrustRow(
              icon: Icons.flash_on_rounded,
              text: 'Average response in a few hours',
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Payment and confirmation',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w900,
              ),
        ),
        const SizedBox(height: 10),
        _PaymentChoiceCard(
          selected: paymentChoice == 'deposit',
          title: depositRequired ? 'Pay deposit now' : 'Pay now',
          subtitle: depositRequired
              ? '$depositMad MAD charged now, remaining at meeting point'
              : 'Secure checkout and instant confirmation',
          icon: Icons.credit_card_rounded,
          onTap: () => onChoiceChanged('deposit'),
        ),
        const SizedBox(height: 8),
        _PaymentChoiceCard(
          selected: paymentChoice == 'later',
          title: 'Pay later',
          subtitle: 'Reserve now, pay at meeting point',
          icon: Icons.event_available_rounded,
          onTap: () => onChoiceChanged('later'),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            color: Theme.of(context).colorScheme.surfaceContainerHighest,
          ),
          child: const Column(
            children: [
              _TrustRow(
                icon: Icons.lock_rounded,
                text: 'Encrypted payment processing',
              ),
              SizedBox(height: 6),
              _TrustRow(
                icon: Icons.verified_user_rounded,
                text: 'Free cancellation according to policy',
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _PaymentChoiceCard extends StatelessWidget {
  const _PaymentChoiceCard({
    required this.selected,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });

  final bool selected;
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final titleColor = selected ? colorScheme.onPrimaryContainer : colorScheme.onSurface;
    final subtitleColor = selected
        ? colorScheme.onPrimaryContainer.withValues(alpha: 0.86)
        : colorScheme.onSurfaceVariant;
    final leadingIconColor = selected ? colorScheme.onPrimaryContainer : colorScheme.onSurface;
    final trailingIconColor = selected ? colorScheme.onPrimaryContainer : colorScheme.outline;
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          color: selected ? colorScheme.primaryContainer : colorScheme.surface,
          border: Border.all(
            color: selected ? colorScheme.primary : colorScheme.outlineVariant,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: leadingIconColor),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                          color: titleColor,
                        ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: subtitleColor,
                        ),
                  ),
                ],
              ),
            ),
            Icon(
              selected ? Icons.check_circle_rounded : Icons.circle_outlined,
              color: trailingIconColor,
            ),
          ],
        ),
      ),
    );
  }
}

class _TrustRow extends StatelessWidget {
  const _TrustRow({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18),
        const SizedBox(width: 8),
        Expanded(child: Text(text)),
      ],
    );
  }
}

class _ConfirmationStep extends StatelessWidget {
  const _ConfirmationStep({
    required this.bookingRef,
    required this.title,
    required this.city,
    required this.selectedDate,
    required this.selectedSlot,
    required this.bookingMode,
    required this.travelers,
    required this.meetingPoint,
    required this.totalMad,
  });

  final String bookingRef;
  final String title;
  final String city;
  final String selectedDate;
  final String selectedSlot;
  final String bookingMode;
  final int travelers;
  final String meetingPoint;
  final int totalMad;

  @override
  Widget build(BuildContext context) {
    final confirmed = bookingMode != 'REQUEST';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            color: Theme.of(context).colorScheme.primaryContainer,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                confirmed ? Icons.verified_rounded : Icons.hourglass_top_rounded,
                color: Theme.of(context).colorScheme.onPrimaryContainer,
                size: 40,
              ),
              const SizedBox(height: 10),
              Text(
                confirmed ? 'Booking confirmed' : 'Request sent',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w900,
                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                    ),
              ),
              const SizedBox(height: 6),
              Text(
                confirmed
                    ? 'Your reservation is secured. Your travel documents are ready below.'
                    : 'Your request is with the operator. Documents are prepared as draft until confirmation.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context)
                          .colorScheme
                          .onPrimaryContainer
                          .withValues(alpha: 0.9),
                    ),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _MetaPill(label: 'Ref $bookingRef'),
                  _MetaPill(label: '$selectedDate • $selectedSlot'),
                  _MetaPill(label: '$travelers traveler(s)'),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        _bookingLine(context, 'Experience', title),
        _bookingLine(context, 'City', city),
        _bookingLine(context, 'Meeting point', meetingPoint),
        _bookingLine(context, 'Total', '$totalMad MAD'),
        Text(
          'Documents',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w900,
              ),
        ),
        const SizedBox(height: 8),
        _MockDocumentCard(
          icon: Icons.qr_code_2_rounded,
          title: 'Boarding voucher',
          subtitle: 'Entry QR, booking reference, emergency contact',
          badge: confirmed ? 'Ready' : 'Draft',
          onTap: () => _openMockDoc(context, 'Boarding Voucher', '''
Experience: $title
Reference: $bookingRef
Date: $selectedDate
Time: $selectedSlot
Travelers: $travelers

[Mock QR]
|||| ||| |||||| |||
||| |||| || ||| |||
'''),
        ),
        const SizedBox(height: 8),
        _MockDocumentCard(
          icon: Icons.receipt_long_rounded,
          title: 'Payment receipt',
          subtitle: 'Paid amount, balance and payment status',
          badge: confirmed ? 'Issued' : 'Pending',
          onTap: () => _openMockDoc(context, 'Payment Receipt', '''
Reference: $bookingRef
Experience: $title
Total: $totalMad MAD
Status: ${confirmed ? 'Confirmed' : 'Awaiting approval'}
Issued at: ${DateTime.now()}
'''),
        ),
        const SizedBox(height: 8),
        _MockDocumentCard(
          icon: Icons.description_rounded,
          title: 'Trip brief',
          subtitle: 'Meeting instructions, what to bring, support line',
          badge: 'Ready',
          onTap: () => _openMockDoc(context, 'Trip Brief', '''
Meeting point:
$meetingPoint

What to bring:
- Passport/ID
- Comfortable shoes
- Water bottle

Support:
+212 5XX XX XX XX
'''),
        ),
        const SizedBox(height: 10),
        FilledButton.tonalIcon(
          onPressed: () => _openMockDoc(context, 'All documents (ZIP)', '''
Mock export generated:
- voucher.pdf
- receipt.pdf
- trip-brief.pdf
'''),
          icon: const Icon(Icons.download_rounded),
          label: const Text('Download all documents'),
        ),
      ],
    );
  }

  Widget _bookingLine(BuildContext context, String key, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(
              key,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
          ),
        ],
      ),
    );
  }

  void _openMockDoc(BuildContext context, String title, String content) {
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: SingleChildScrollView(
          child: Text(
            content,
            style: const TextStyle(fontFamily: 'monospace'),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}

class _MockDocumentCard extends StatelessWidget {
  const _MockDocumentCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.badge,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final String badge;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
        ),
        child: Row(
          children: [
            Icon(icon),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(999),
                color: Theme.of(context).colorScheme.surfaceContainerHighest,
              ),
              child: Text(
                badge,
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MetaPill extends StatelessWidget {
  const _MetaPill({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: Theme.of(context).colorScheme.onPrimaryContainer.withValues(alpha: 0.1),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: Theme.of(context).colorScheme.onPrimaryContainer,
              fontWeight: FontWeight.w800,
            ),
      ),
    );
  }
}

class _BottomSummary extends StatelessWidget {
  const _BottomSummary({
    required this.priceFromMad,
    required this.guests,
    required this.bookingMode,
    required this.depositMad,
    required this.paymentChoice,
  });

  final int priceFromMad;
  final int guests;
  final String bookingMode;
  final int depositMad;
  final String paymentChoice;

  @override
  Widget build(BuildContext context) {
    final subtotal = priceFromMad * guests;
    final dueNow = bookingMode == 'REQUEST'
        ? 0
        : paymentChoice == 'later'
            ? 0
            : (depositMad > 0 ? depositMad : subtotal);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              'Total: $subtotal MAD',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
            ),
          ),
          Text(
            'Due now: $dueNow MAD',
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
        ],
      ),
    );
  }
}
