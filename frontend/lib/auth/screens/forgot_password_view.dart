import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../design_system/theme/app_colors.dart';
import '../../core/services/api_service.dart';
import '../services/auth_service.dart';

class ForgotPasswordView extends StatefulWidget {
  const ForgotPasswordView({super.key});

  @override
  State<ForgotPasswordView> createState() => _ForgotPasswordViewState();
}

class _ForgotPasswordViewState extends State<ForgotPasswordView> {
  int _currentState = 0;

  final _mobileController = TextEditingController();
  final _otpControllers = List.generate(4, (_) => TextEditingController());
  final _otpFocusNodes = List.generate(4, (_) => FocusNode());
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();

  final _authRepo = AuthRepository(ApiService.instance);

  bool _isLoading = false;
  bool _obscurePassword = true;
  String? _errorMessage;
  String _resetToken = '';

  Future<void> _sendOtp() async {
    final mobile = _mobileController.text.trim();
    if (mobile.length != 10) {
      setState(() => _errorMessage = 'Please enter a valid 10-digit mobile number');
      return;
    }

    setState(() { _isLoading = true; _errorMessage = null; });

    try {
      await _authRepo.sendForgotPasswordOtp(mobile);
      if (mounted) {
        setState(() { _isLoading = false; _currentState = 1; });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = ApiService.getErrorMessage(e);
        });
      }
    }
  }

  Future<void> _verifyOtp() async {
    final otp = _otpControllers.map((c) => c.text).join();
    if (otp.length != 4) {
      setState(() => _errorMessage = 'Please enter the 4-digit code');
      return;
    }

    setState(() { _isLoading = true; _errorMessage = null; });

    try {
      _resetToken = await _authRepo.verifyForgotPasswordOtp(
        _mobileController.text.trim(),
        otp,
      );
      if (mounted) {
        setState(() { _isLoading = false; _currentState = 2; });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = ApiService.getErrorMessage(e);
        });
      }
    }
  }

  Future<void> _resetPassword() async {
    final password = _passwordController.text;
    final confirm = _confirmController.text;

    if (password.length < 6) {
      setState(() => _errorMessage = 'Password must be at least 6 characters');
      return;
    }
    if (password != confirm) {
      setState(() => _errorMessage = 'Passwords do not match');
      return;
    }

    setState(() { _isLoading = true; _errorMessage = null; });

    try {
      await _authRepo.resetPassword(_resetToken, password);
      if (mounted) {
        setState(() { _isLoading = false; _currentState = 3; });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = ApiService.getErrorMessage(e);
        });
      }
    }
  }

  void _handleAction() {
    switch (_currentState) {
      case 0: _sendOtp(); break;
      case 1: _verifyOtp(); break;
      case 2: _resetPassword(); break;
    }
  }

  @override
  void dispose() {
    _mobileController.dispose();
    for (var c in _otpControllers) { c.dispose(); }
    for (var f in _otpFocusNodes) { f.dispose(); }
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context).textTheme;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: _currentState < 3
            ? IconButton(
                icon: const Icon(Icons.arrow_back_rounded, color: AppColors.textPrimary),
                onPressed: () {
                  if (_currentState == 0) {
                    Navigator.pop(context);
                  } else {
                    setState(() { _currentState--; _errorMessage = null; });
                  }
                },
              )
            : null,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 8),
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 400),
            transitionBuilder: (child, animation) => FadeTransition(opacity: animation, child: child),
            child: _buildCurrentState(theme),
          ),
        ),
      ),
    );
  }

  Widget _buildCurrentState(TextTheme theme) {
    switch (_currentState) {
      case 0: return _buildMobileInput(theme, key: const ValueKey(0));
      case 1: return _buildOTPInput(theme, key: const ValueKey(1));
      case 2: return _buildNewPassword(theme, key: const ValueKey(2));
      case 3: return _buildSuccess(theme, key: const ValueKey(3));
      default: return const SizedBox.shrink();
    }
  }

  Widget _buildProgressDots() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 32),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(3, (i) {
          final isActive = i <= _currentState;
          return Container(
            width: isActive ? 24 : 8,
            height: 8,
            margin: const EdgeInsets.symmetric(horizontal: 3),
            decoration: BoxDecoration(
              color: isActive ? AppColors.primary : AppColors.border,
              borderRadius: BorderRadius.circular(4),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildErrorBanner() {
    if (_errorMessage == null) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.destructive.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            const Icon(Icons.info_outline_rounded, size: 18, color: AppColors.destructive),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                _errorMessage!,
                style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.destructive),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMobileInput(TextTheme theme, {required Key key}) {
    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildProgressDots(),
        Text('Forgot Password?', style: theme.displayMedium),
        const SizedBox(height: 10),
        Text("Enter your registered mobile number and we'll send you a verification code.", style: theme.bodyMedium),
        const SizedBox(height: 40),
        _buildErrorBanner(),
        Text('Mobile Number', style: theme.labelLarge),
        const SizedBox(height: 8),
        TextField(
          controller: _mobileController,
          keyboardType: TextInputType.phone,
          maxLength: 10,
          enabled: !_isLoading,
          style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w500),
          decoration: const InputDecoration(
            hintText: 'Enter 10-digit number',
            counterText: '',
            prefixIcon: Icon(Icons.phone_outlined, size: 20, color: AppColors.textTertiary),
          ),
        ),
        const SizedBox(height: 32),
        SizedBox(height: 52, child: ElevatedButton(
          onPressed: _isLoading ? null : _handleAction,
          child: _isLoading
              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : const Text('Send Code'),
        )),
      ],
    );
  }

  Widget _buildOTPInput(TextTheme theme, {required Key key}) {
    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildProgressDots(),
        Text('Verify Number', style: theme.displayMedium),
        const SizedBox(height: 10),
        RichText(
          text: TextSpan(
            style: theme.bodyMedium,
            children: [
              const TextSpan(text: 'Enter the 4-digit code sent to '),
              TextSpan(
                text: '+91 ${_mobileController.text}',
                style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: AppColors.textPrimary),
              ),
            ],
          ),
        ),
        const SizedBox(height: 40),
        _buildErrorBanner(),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(4, (i) {
            return Container(
              width: 56,
              height: 60,
              margin: const EdgeInsets.symmetric(horizontal: 6),
              child: TextField(
                controller: _otpControllers[i],
                focusNode: _otpFocusNodes[i],
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                maxLength: 1,
                enabled: !_isLoading,
                style: GoogleFonts.poppins(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                decoration: InputDecoration(
                  counterText: '',
                  filled: true,
                  fillColor: AppColors.surface,
                  contentPadding: const EdgeInsets.symmetric(vertical: 16),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primary, width: 2)),
                ),
                onChanged: (v) {
                  if (v.isNotEmpty && i < 3) {
                    _otpFocusNodes[i + 1].requestFocus();
                  } else if (v.isEmpty && i > 0) {
                    _otpFocusNodes[i - 1].requestFocus();
                  }
                },
              ),
            );
          }),
        ),
        const SizedBox(height: 32),
        SizedBox(height: 52, child: ElevatedButton(
          onPressed: _isLoading ? null : _handleAction,
          child: _isLoading
              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : const Text('Verify'),
        )),
        const SizedBox(height: 20),
        Center(
          child: TextButton(
            onPressed: _isLoading ? null : _sendOtp,
            child: Text("Didn't receive code? Resend", style: GoogleFonts.inter(fontWeight: FontWeight.w600, color: AppColors.accent, fontSize: 13)),
          ),
        ),
      ],
    );
  }

  Widget _buildNewPassword(TextTheme theme, {required Key key}) {
    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildProgressDots(),
        Text('New Password', style: theme.displayMedium),
        const SizedBox(height: 10),
        Text('Create a strong password to protect your account.', style: theme.bodyMedium),
        const SizedBox(height: 40),
        _buildErrorBanner(),
        Text('Password', style: theme.labelLarge),
        const SizedBox(height: 8),
        TextField(
          controller: _passwordController,
          obscureText: _obscurePassword,
          enabled: !_isLoading,
          style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w500),
          decoration: InputDecoration(
            hintText: 'Minimum 6 characters',
            suffixIcon: IconButton(
              icon: Icon(_obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 20, color: AppColors.textTertiary),
              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
            ),
          ),
        ),
        const SizedBox(height: 20),
        Text('Confirm Password', style: theme.labelLarge),
        const SizedBox(height: 8),
        TextField(
          controller: _confirmController,
          obscureText: _obscurePassword,
          enabled: !_isLoading,
          style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w500),
          decoration: const InputDecoration(hintText: 'Re-type new password'),
        ),
        const SizedBox(height: 32),
        SizedBox(height: 52, child: ElevatedButton(
          onPressed: _isLoading ? null : _handleAction,
          child: _isLoading
              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : const Text('Update Password'),
        )),
      ],
    );
  }

  Widget _buildSuccess(TextTheme theme, {required Key key}) {
    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SizedBox(height: MediaQuery.of(context).size.height * 0.08),
        Center(
          child: Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.success.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_rounded, size: 40, color: AppColors.success),
          ),
        ),
        const SizedBox(height: 32),
        Text("You're all set!", style: theme.displayMedium, textAlign: TextAlign.center),
        const SizedBox(height: 12),
        Text(
          'Your password has been updated successfully. You can now sign in with your new password.',
          style: theme.bodyMedium,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 48),
        SizedBox(height: 52, child: ElevatedButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Back to Sign In'),
        )),
      ],
    );
  }
}
