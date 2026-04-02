import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'design_system/theme/app_theme.dart';
import 'auth/screens/auth_screen.dart';
import 'auth/screens/landing_screen.dart';
import 'dashboard/screens/main_dashboard_screen.dart';
import 'health/screens/health_records_screen.dart';
import 'breeding/screens/breeding_dashboard_screen.dart';
import 'production/screens/milk_production_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await dotenv.load(fileName: ".env");
  } catch(e) {
    // Ignore dotenv for now if .env doesn't exist to prevent crash
  }
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart Gaushala App',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialRoute: '/',
      routes: {
        '/': (context) => const LandingScreen(),
        '/auth': (context) => const AuthScreen(),
        '/dashboard': (context) => const MainDashboardScreen(),
        '/health': (context) => const HealthRecordsScreen(),
        '/breeding': (context) => const BreedingDashboardScreen(),
        '/production': (context) => const MilkProductionScreen(),
        '/analytics': (context) => const MilkAnalyticsScreen(),
      },
    );
  }
}
