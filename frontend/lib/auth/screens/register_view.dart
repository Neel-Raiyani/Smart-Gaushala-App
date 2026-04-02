import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../design_system/theme/app_colors.dart';
import '../../core/widgets/app_error_widget.dart';
import '../providers/auth_provider.dart';

class RegisterView extends ConsumerStatefulWidget {
  final VoidCallback onToggle;
  const RegisterView({super.key, required this.onToggle});

  @override
  ConsumerState<RegisterView> createState() => _RegisterViewState();
}

class _RegisterViewState extends ConsumerState<RegisterView> {
  final _formKey1 = GlobalKey<FormState>();
  final _formKey2 = GlobalKey<FormState>();

  final _gaushalaNameController = TextEditingController();
  final _cityController = TextEditingController();
  final _totalCattleController = TextEditingController();
  final _nameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();

  bool _obscurePassword = true;
  int _currentStep = 0;
  String? _errorMessage;

  void _nextStep() {
    if (_formKey1.currentState!.validate()) {
      setState(() { _errorMessage = null; _currentStep = 1; });
    }
  }

  void _prevStep() {
    setState(() { _errorMessage = null; _currentStep = 0; });
  }

  Future<void> _handleRegister() async {
    if (!_formKey2.currentState!.validate()) return;

    setState(() => _errorMessage = null);

    final error = await ref.read(authProvider.notifier).register(
      name: _nameController.text.trim(),
      mobileNumber: _mobileController.text.trim(),
      password: _passwordController.text,
      confirmPassword: _confirmController.text,
      gaushalaName: _gaushalaNameController.text.trim(),
      city: _cityController.text.trim(),
      totalCattle: int.tryParse(_totalCattleController.text) ?? 0,
    );

    if (!mounted) return;

    if (error == null) {
      AppSnackBar.showSuccess(context, 'Registration successful! Please sign in.');
      widget.onToggle();
    } else {
      setState(() => _errorMessage = error);
    }
  }

  @override
  void dispose() {
    _gaushalaNameController.dispose();
    _cityController.dispose();
    _totalCattleController.dispose();
    _nameController.dispose();
    _mobileController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context).textTheme;
    final authState = ref.watch(authProvider);
    final isLoading = authState.isLoading;

    return SafeArea(
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Logo + Brand
              Center(
                child: Image.asset(
                  'assets/images/cow_icon.png',
                  height: 72,
                  fit: BoxFit.contain,
                  errorBuilder: (_, _, _) => const Icon(Icons.cruelty_free, size: 56, color: AppColors.primary),
                ),
              ),
              const SizedBox(height: 24),
              Text('Create Account', style: theme.headlineLarge, textAlign: TextAlign.center),
              const SizedBox(height: 6),
              Text('Register your gaushala in 2 simple steps.', style: theme.bodyMedium, textAlign: TextAlign.center),
              const SizedBox(height: 32),

              // Step Indicator
              _buildStepIndicator(),
              const SizedBox(height: 28),

              // Error
              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: AppColors.destructive.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline_rounded, size: 18, color: AppColors.destructive),
                      const SizedBox(width: 10),
                      Expanded(child: Text(_errorMessage!, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.destructive))),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // Pages
              _currentStep == 0 ? _buildStep1(theme) : _buildStep2(theme, isLoading),
              const SizedBox(height: 28),

              // Actions
              if (_currentStep == 0)
                SizedBox(
                  height: 52,
                  child: ElevatedButton(
                    onPressed: _nextStep,
                    child: const Text('Continue'),
                  ),
                )
              else
                Row(
                  children: [
                    Expanded(
                      child: SizedBox(
                        height: 52,
                        child: OutlinedButton(
                          onPressed: isLoading ? null : _prevStep,
                          child: const Text('Back'),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: SizedBox(
                        height: 52,
                        child: ElevatedButton(
                          onPressed: isLoading ? null : _handleRegister,
                          child: isLoading
                              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                              : const Text('Create Account'),
                        ),
                      ),
                    ),
                  ],
                ),
              const SizedBox(height: 28),

              // Sign In CTA
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Already have an account? ', style: theme.bodyMedium),
                  GestureDetector(
                    onTap: isLoading ? null : widget.onToggle,
                    child: Text('Sign In', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Row(
      children: [
        Expanded(child: _buildStepDot(0, 'Gaushala')),
        Container(
          width: 40,
          height: 1.5,
          color: _currentStep >= 1 ? AppColors.primary : AppColors.border,
        ),
        Expanded(child: _buildStepDot(1, 'Profile')),
      ],
    );
  }

  Widget _buildStepDot(int step, String label) {
    final isActive = _currentStep >= step;
    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: isActive ? AppColors.primary : AppColors.surfaceTint,
            shape: BoxShape.circle,
            border: isActive ? null : Border.all(color: AppColors.border),
          ),
          child: Center(
            child: isActive
                ? (step < _currentStep
                    ? const Icon(Icons.check, size: 16, color: Colors.white)
                    : Text('${step + 1}', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white)))
                : Text('${step + 1}', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textTertiary)),
          ),
        ),
        const SizedBox(height: 6),
        Text(label, style: GoogleFonts.inter(fontSize: 12, fontWeight: isActive ? FontWeight.w600 : FontWeight.w400, color: isActive ? AppColors.primary : AppColors.textTertiary)),
      ],
    );
  }

  Widget _buildStep1(TextTheme theme) {
    return Form(
      key: _formKey1,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Gaushala Name', style: theme.labelLarge),
          const SizedBox(height: 8),
          TextFormField(
            controller: _gaushalaNameController,
            style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w500),
            decoration: const InputDecoration(hintText: 'e.g. Shree Krishna Gaushala'),
            validator: (v) => v!.isEmpty ? 'Required' : null,
          ),
          const SizedBox(height: 20),
          Text('City', style: theme.labelLarge),
          const SizedBox(height: 8),
          TextFormField(
            controller: _cityController,
            style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w500),
            decoration: const InputDecoration(hintText: 'e.g. Rajkot, Gujarat'),
            validator: (v) => v!.isEmpty ? 'Required' : null,
          ),
          const SizedBox(height: 20),
          Text('Total Cattle (Optional)', style: theme.labelLarge),
          const SizedBox(height: 8),
          TextFormField(
            controller: _totalCattleController,
            keyboardType: TextInputType.number,
            style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w500),
            decoration: const InputDecoration(hintText: 'e.g. 50'),
          ),
        ],
      ),
    );
  }

  Widget _buildStep2(TextTheme theme, bool isLoading) {
    return Form(
      key: _formKey2,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Full Name', style: theme.labelLarge),
          const SizedBox(height: 8),
          TextFormField(
            controller: _nameController,
            enabled: !isLoading,
            style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w500),
            decoration: const InputDecoration(hintText: 'Owner full name'),
            validator: (v) => v!.isEmpty ? 'Required' : null,
          ),
          const SizedBox(height: 20),
          Text('Mobile Number', style: theme.labelLarge),
          const SizedBox(height: 8),
          TextFormField(
            controller: _mobileController,
            keyboardType: TextInputType.phone,
            maxLength: 10,
            enabled: !isLoading,
            style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w500),
            decoration: const InputDecoration(hintText: '10-digit mobile number', counterText: ''),
            validator: (v) => v!.length != 10 ? 'Enter valid 10-digit number' : null,
          ),
          const SizedBox(height: 20),
          Text('Password', style: theme.labelLarge),
          const SizedBox(height: 8),
          TextFormField(
            controller: _passwordController,
            obscureText: _obscurePassword,
            enabled: !isLoading,
            style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w500),
            decoration: InputDecoration(
              hintText: 'Minimum 6 characters',
              suffixIcon: IconButton(
                icon: Icon(_obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 20, color: AppColors.textTertiary),
                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
              ),
            ),
            validator: (v) => v!.length < 6 ? 'Too short' : null,
          ),
          const SizedBox(height: 20),
          Text('Confirm Password', style: theme.labelLarge),
          const SizedBox(height: 8),
          TextFormField(
            controller: _confirmController,
            obscureText: _obscurePassword,
            enabled: !isLoading,
            style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w500),
            decoration: const InputDecoration(hintText: 'Re-type password'),
            validator: (v) => v != _passwordController.text ? 'Passwords do not match' : null,
          ),
        ],
      ),
    );
  }
}
