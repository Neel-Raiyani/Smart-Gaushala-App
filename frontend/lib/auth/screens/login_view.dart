import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../design_system/theme/app_colors.dart';
import '../providers/auth_provider.dart';
import 'gaushala_selection_screen.dart';
import 'forgot_password_view.dart';

class LoginView extends ConsumerStatefulWidget {
  final VoidCallback onToggle;
  const LoginView({super.key, required this.onToggle});

  @override
  ConsumerState<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends ConsumerState<LoginView> {
  final _mobileController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;
  String? _errorMessage;

  Future<void> _handleLogin() async {
    final mobile = _mobileController.text.trim();
    final password = _passwordController.text;

    if (mobile.isEmpty || password.isEmpty) {
      setState(() => _errorMessage = 'Please enter mobile number and password');
      return;
    }
    if (mobile.length != 10) {
      setState(() => _errorMessage = 'Please enter a valid 10-digit mobile number');
      return;
    }

    setState(() => _errorMessage = null);

    final result = await ref.read(authProvider.notifier).login(mobile, password);

    if (!mounted) return;

    switch (result) {
      case LoginResult.success:
        Navigator.pushReplacementNamed(context, '/dashboard');
        break;
      case LoginResult.needsGaushalaSelection:
        final gaushalas = ref.read(authProvider).gaushalas;
        final selected = await Navigator.push<bool>(
          context,
          MaterialPageRoute(
            builder: (_) => GaushalaSelectionScreen(gaushalas: gaushalas),
          ),
        );
        if (selected == true && mounted) {
          Navigator.pushReplacementNamed(context, '/dashboard');
        }
        break;
      case LoginResult.error:
        setState(() {
          _errorMessage = ref.read(authProvider).errorMessage;
        });
        break;
    }
  }

  @override
  void dispose() {
    _mobileController.dispose();
    _passwordController.dispose();
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
                  height: 88,
                  fit: BoxFit.contain,
                  errorBuilder: (_, _, _) => const Icon(
                    Icons.cruelty_free,
                    size: 64,
                    color: AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Center(
                child: Text(
                  'Smart Gaushala',
                  style: GoogleFonts.poppins(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(height: 40),

              // Greeting
              Text('Welcome back', style: theme.headlineLarge),
              const SizedBox(height: 6),
              Text(
                'Sign in to manage your gaushala operations.',
                style: theme.bodyMedium,
              ),
              const SizedBox(height: 32),

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
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: AppColors.destructive,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // Mobile input
              Text('Mobile Number', style: theme.labelLarge),
              const SizedBox(height: 8),
              TextField(
                controller: _mobileController,
                keyboardType: TextInputType.phone,
                maxLength: 10,
                enabled: !isLoading,
                style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w500),
                decoration: const InputDecoration(
                  hintText: 'Enter 10-digit mobile number',
                  counterText: '',
                  prefixIcon: Icon(Icons.phone_outlined, size: 20, color: AppColors.textTertiary),
                ),
              ),
              const SizedBox(height: 20),

              // Password
              Text('Password', style: theme.labelLarge),
              const SizedBox(height: 8),
              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                enabled: !isLoading,
                style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w500),
                decoration: InputDecoration(
                  hintText: 'Enter your password',
                  prefixIcon: const Icon(Icons.lock_outline_rounded, size: 20, color: AppColors.textTertiary),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                      size: 20,
                      color: AppColors.textTertiary,
                    ),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                ),
                onSubmitted: (_) => _handleLogin(),
              ),

              // Forgot Password
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ForgotPasswordView()),
                  ),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    foregroundColor: AppColors.accent,
                  ),
                  child: Text(
                    'Forgot password?',
                    style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.accent),
                  ),
                ),
              ),
              const SizedBox(height: 8),

              // Sign In Button
              SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: isLoading ? null : _handleLogin,
                  child: isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Sign In'),
                ),
              ),
              const SizedBox(height: 32),

              // Register CTA
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text("Don't have an account? ", style: theme.bodyMedium),
                  GestureDetector(
                    onTap: isLoading ? null : widget.onToggle,
                    child: Text(
                      'Register',
                      style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
