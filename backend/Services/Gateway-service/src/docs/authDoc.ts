/**
 * @swagger
 * tags:
 *   - name: Auth Service
 *     description: User authentication, registration, profile management, and Gaushala selection.
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   parameters:
 *     GaushalaIdHeader:
 *       in: header
 *       name: gaushala-id
 *       required: true
 *       schema:
 *         type: string
 *         description: Multi-tenant scope identifier for the gaushala.
 *
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         errorCode:
 *           type: string
 *           example: 'UNAUTHORIZED'
 *         message:
 *           type: string
 *           example: 'Invalid authentication token'
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         errorCode:
 *           type: string
 *           example: 'VALIDATION_FAILED'
 *         message:
 *           type: string
 *           example: 'Request validation failed'
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: 'mobileNumber'
 *               message:
 *                 type: string
 *                 example: 'Valid Indian mobile number is required'
 *
 *     User:
 *       type: object
 *       description: Details of the authenticated user.
 *       properties:
 *         id:
 *           type: string
 *           description: Unique user identifier.
 *         mobileNumber:
 *           type: string
 *           description: Registered mobile number (Unique).
 *         name:
 *           type: string
 *           description: User's full name.
 *         city:
 *           type: string
 *           description: User's home city.
 *         language:
 *           type: string
 *           enum: [ENGLISH, GUJARATI, HINDI]
 *           description: User's preferred interface language.
 *         gaushalas:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserGaushala'
 *           description: List of gaushalas where the user has a registered role.
 *
 *     Gaushala:
 *       type: object
 *       description: Basic metadata of a Gaushala.
 *       properties:
 *         id:
 *           type: string
 *           description: Unique gaushala identifier.
 *         name:
 *           type: string
 *           description: Display name of the gaushala.
 *         city:
 *           type: string
 *           description: City where the gaushala is located.
 *         totalCattle:
 *           type: integer
 *           description: Total registered cattle count.
 *
 *     UserGaushala:
 *       type: object
 *       description: Representation of a user's membership and role within a specific gaushala.
 *       properties:
 *         id:
 *           type: string
 *           description: Gaushala ID.
 *         name:
 *           type: string
 *           description: Gaushala Name.
 *         role:
 *           type: string
 *           enum: [OWNER, MANAGER, STAFF, VETERINARIAN]
 *           description: User's designated role in this gaushala.
 *         city:
 *           type: string
 *           description: Gaushala City.
 *
 *     Staff:
 *       type: object
 *       description: Details for adding/updating gaushala staff.
 *       required: [mobileNumber, name, role]
 *       properties:
 *         mobileNumber:
 *           type: string
 *           pattern: '^[6-9]\d{9}$'
 *           example: '9876543210'
 *         name:
 *           type: string
 *           minLength: 1
 *           example: 'Rahul Sharma'
 *         city:
 *           type: string
 *           minLength: 1
 *         role:
 *           type: string
 *           enum: [MANAGER, STAFF, VETERINARIAN]
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new Gaushala Owner
 *     description: Creates a new user profile and their primary gaushala. The registering user is automatically assigned the 'OWNER' role.
 *     tags: [Auth Service]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mobileNumber, password, confirmPassword, name, city, gaushalaName]
 *             properties:
 *               mobileNumber:
 *                 type: string
 *                 pattern: '^[6-9]\d{9}$'
 *                 example: '9876543210'
 *                 description: Valid 10-digit Indian mobile number.
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: Password@123
 *                 description: Secure password (Min 6 characters).
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: Password@123
 *                 description: Must match the password.
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 example: Neel Raiyani
 *               city:
 *                 type: string
 *                 minLength: 1
 *                 example: Rajkot
 *               gaushalaName:
 *                 type: string
 *                 minLength: 1
 *                 example: Gopal Gaushala
 *                 description: Name of the first gaushala to be created.
 *               totalCattle:
 *                 type: integer
 *                 minimum: 0
 *                 example: 50
 *                 description: Estimated initial cattle count.
 *     responses:
 *       201:
 *         description: User and Gaushala registered successfully.
 *       400:
 *         description: Validation error or mobile number already registered.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to the system
 *     description: Authenticates user credentials and returns a JWT token.
 *     tags: [Auth Service]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mobileNumber, password]
 *             properties:
 *               mobileNumber:
 *                 type: string
 *                 pattern: '^[6-9]\d{9}$'
 *                 example: '9876543210'
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Login successful. Returns JWT.
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Invalid mobile number or password.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieves the full user profile including their memberships across various gaushalas.
 *     tags: [Auth Service]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Missing or invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/profile/fcm-token:
 *   post:
 *     summary: Register device FCM token
 *     description: Stores the Firebase Cloud Messaging token for the current user to enable push notifications.
 *     tags: [Auth Service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fcmToken]
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 example: 'fcm-registration-token-string'
 *     responses:
 *       200:
 *         description: Token registered successfully.
 *       400:
 *         $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/auth/gaushala:
 *   post:
 *     summary: Create an additional Gaushala
 *     description: Creates a new gaushala and links it to the current user as an 'OWNER'.
 *     tags: [Auth Service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, city]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 example: Krishna Gaushala
 *               city:
 *                 type: string
 *                 minLength: 1
 *                 example: Ahmedabad
 *               totalCattle:
 *                 type: integer
 *                 minimum: 0
 *                 example: 20
 *     responses:
 *       201:
 *         description: Additional gaushala created.
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized.
 */

/**
 * @swagger
 * /api/auth/gaushala/my:
 *   get:
 *     summary: Get user's gaushalas
 *     description: Returns a list of all gaushalas where the user holds a role (Owner, Manager, Staff, etc.).
 *     tags: [Auth Service]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of gaushalas memberships.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserGaushala'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/auth/forgot-password/send-otp:
 *   post:
 *     summary: Send OTP for password reset
 *     description: Sends a 4-digit verification code to the registered mobile number via SMS.
 *     tags: [Auth Service]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mobileNumber]
 *             properties:
 *               mobileNumber:
 *                 type: string
 *                 pattern: '^[6-9]\d{9}$'
 *                 example: '9876543210'
 *     responses:
 *       200:
 *         description: OTP successfully dispatched.
 *       400:
 *         description: Validation error.
 *       404:
 *         description: Mobile number not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/forgot-password/verify:
 *   post:
 *     summary: Verify OTP and Reset Password
 *     description: Validates the 4-digit code and applies the new password to the user account.
 *     tags: [Auth Service]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mobileNumber, otp, newPassword, confirmPassword]
 *             properties:
 *               mobileNumber:
 *                 type: string
 *                 pattern: '^[6-9]\d{9}$'
 *                 example: '9876543210'
 *               otp:
 *                 type: string
 *                 minLength: 4
 *                 maxLength: 6
 *                 example: '1234'
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: NewSecurePassword@123
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: NewSecurePassword@123
 *                 description: Must match the new password.
 *     responses:
 *       200:
 *         description: Password reset complete.
 *       400:
 *         description: Invalid or expired OTP / Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Force Change Password
 *     description: Securely updates user password by verifying the existing (old) password.
 *     tags: [Auth Service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword, confirmPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: ChangedPassword@789
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: ChangedPassword@789
 *                 description: Must match the new password.
 *     responses:
 *       200:
 *         description: Password updated.
 *       400:
 *         description: Old password verification failed / Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/auth/settings:
 *   put:
 *     summary: Update gaushala preferences
 *     description: Modifies gaushala-specific settings like default application language. Requires MANAGER or OWNER role.
 *     tags: [Auth Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 example: GUJARATI
 *                 enum: [ENGLISH, GUJARATI, HINDI]
 *     responses:
 *       200:
 *         description: Settings saved.
 *       400:
 *         description: Validation error.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Permission denied for this gaushala.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// ───────────────────────── Staff Management ─────────────────────────

/**
 * @swagger
 * /api/auth/staff:
 *   post:
 *     summary: Add new staff member
 *     description: Creates a link between an existing user and a gaushala with a specific role.
 *     tags: [Auth Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Staff'
 *     responses:
 *       201:
 *         description: Staff added.
 *       400:
 *         $ref: '#/components/schemas/ValidationErrorResponse'
 *   get:
 *     summary: List gaushala staff
 *     description: Retrieves all users who hold a role in the specified gaushala.
 *     tags: [Auth Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Staff list.
 */

/**
 * @swagger
 * /api/auth/staff/{userId}:
 *   patch:
 *     summary: Update staff role
 *     tags: [Auth Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               city:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [MANAGER, STAFF, VETERINARIAN]
 *     responses:
 *       200:
 *         description: Role updated.
 *   delete:
 *     summary: Remove staff member
 *     description: Revokes a user's access to the gaushala.
 *     tags: [Auth Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Staff member removed.
 */

/**
 * @swagger
 * components:
 *   responses:
 *     UnauthorizedError:
 *       description: Missing or invalid token.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     ForbiddenError:
 *       description: Permission denied.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     InternalError:
 *       description: Unexpected server error.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 */
