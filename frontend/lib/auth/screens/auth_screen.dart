import 'package:flutter/material.dart';
import '../../design_system/theme/app_colors.dart';
import 'login_view.dart';
import 'register_view.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool _showLogin = true;

  void _toggleView() {
    setState(() => _showLogin = !_showLogin);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        child: _showLogin
            ? LoginView(key: const ValueKey('login'), onToggle: _toggleView)
            : RegisterView(key: const ValueKey('register'), onToggle: _toggleView),
      ),
    );
  }
}
