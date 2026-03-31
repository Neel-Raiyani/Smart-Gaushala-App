/**
 * @swagger
 * tags:
 *   - name: Health Service
 *     description: Animal health lifecycle management, including disease tracking, vaccinations, medical history, and deworming.
 *
 * components:
 *   schemas:
 *     DiseaseMaster:
 *       type: object
 *       description: Reference record for a known bovine disease.
 *       properties:
 *         id:
 *           type: string
 *           example: '65d1234567890abcdef12345'
 *         name:
 *           type: string
 *           minLength: 1
 *           example: 'Foot and Mouth Disease'
 *           description: Common name of the illness.
 *         gaushalaId:
 *           type: string
 *           format: mongo-id
 *           nullable: true
 *           description: ID of the owning gaushala. null indicates a system-wide common disease.
 *
 *     VaccineMaster:
 *       type: object
 *       description: Reference record for available vaccines.
 *       properties:
 *         id:
 *           type: string
 *           example: '65d1234567890abcdef12346'
 *         name:
 *           type: string
 *           minLength: 1
 *           example: 'FMD Vaccine'
 *           description: Commercial or scientific name of the vaccine.
 *         frequencyMonths:
 *           type: integer
 *           minimum: 0
 *           description: Recommended interval between doses in months.
 *         gaushalaId:
 *           type: string
 *           format: mongo-id
 *           nullable: true
 *           description: ID of the owning gaushala. null indicates a system-wide common vaccine.
 *
 *     LabtestMaster:
 *       type: object
 *       description: Reference record for laboratory diagnostic tests.
 *       properties:
 *         id:
 *           type: string
 *           example: '65d1234567890abcdef12347'
 *         name:
 *           type: string
 *           minLength: 1
 *           example: 'Mastitis CMT'
 *           description: Name of the diagnostic procedure.
 *         gaushalaId:
 *           type: string
 *           format: mongo-id
 *           nullable: true
 *           description: ID of the owning gaushala. null indicates a system-wide common lab test.
 *
 *     Species:
 *       type: string
 *       enum: [COW, BUFFALO]
 *       description: Generic classification of bovine.
 *
 *     MedicalRecord:
 *       type: object
 *       description: Detailed entry for a veterinary visit or health check.
 *       required: [animalId, visitType, visitDate, medicalStatus]
 *       properties:
 *         id:
 *           type: string
 *         animalId:
 *           type: string
 *           format: mongo-id
 *           description: Host animal ID.
 *         visitType:
 *           type: string
 *           enum: [ILLNESS, CHECKUP]
 *           description: Reason for the veterinary interaction.
 *         visitDate:
 *           type: string
 *           format: date
 *           description: Precise date of the visit.
 *         visitNumber:
 *           type: string
 *           description: Internal visit sequence or token.
 *         vetId:
 *           type: string
 *           format: mongo-id
 *           description: ID of the attending veterinarian (Managed in Auth/Gaushala).
 *         diseaseId:
 *           type: string
 *           format: mongo-id
 *           description: diagnosed disease (if visitType is ILLNESS).
 *         medicalStatus:
 *           type: string
 *           enum: [SICK, HEALTHY]
 *           description: Resulting health status after the visit.
 *         symptoms:
 *           type: string
 *           description: Observed signs of illness.
 *         treatment:
 *           type: string
 *           description: Prescribed medications or actions.
 *
 *     VaccinationRecord:
 *       type: object
 *       description: Documentation for a single vaccine dose administration.
 *       required: [animalId, doseDate, doseType, vaccineId]
 *       properties:
 *         id:
 *           type: string
 *         animalId:
 *           type: string
 *           format: mongo-id
 *         doseDate:
 *           type: string
 *           format: date
 *           description: Date of administration.
 *         doseType:
 *           type: string
 *           enum: [FIRST, BOOSTER, REPEAT]
 *           description: Placement in the vaccination cycle.
 *         vaccineId:
 *           type: string
 *           format: mongo-id
 *           description: Reference to VaccineMaster.
 *         remark:
 *           type: string
 *
 *     DewormingRecord:
 *       type: object
 *       description: Tracking for internal parasite treatments.
 *       required: [animalId, doseDate, doseType, vetId]
 *       properties:
 *         id:
 *           type: string
 *         animalId:
 *           type: string
 *           format: mongo-id
 *         doseDate:
 *           type: string
 *           format: date
 *         doseType:
 *           type: string
 *           enum: [INJECTION, TABLET]
 *           description: Mode of administration.
 *         companyName:
 *           type: string
 *           description: Manufacturer of the dewormer.
 *         quantity:
 *           type: string
 *           example: '500mg'
 *         vetId:
 *           type: string
 *           format: mongo-id
 *         nextDoseDate:
 *           type: string
 *           format: date
 *           description: Scheduled date for followup.
 */

// ───────────────────────── Master Lists ─────────────────────────

/**
 * @swagger
 * /api/health/master/diseases:
 *   get:
 *     summary: List all cataloged diseases
 *     description: Retrieves the master list of diseases. Returns common diseases (system-wide) merged with gaushala-specific records. If a gaushala-specific disease has the same name as a common one, the gaushala-specific version takes precedence.
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Disease array.
 *   post:
 *     summary: Add to disease catalog
 *     description: Creates a new disease master record specifically for this gaushala.
 *     tags: [Health Service]
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
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 example: Lumpy Skin Disease
 *     responses:
 *       201:
 *         description: Master entry created.
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */

/**
 * @swagger
 * /api/health/master/vaccines:
 *   get:
 *     summary: List all vaccines
 *     description: Retrieves the master list of available vaccinations. Returns common vaccines (system-wide) merged with gaushala-specific records. If a gaushala-specific vaccine has the same name as a common one, the gaushala-specific version takes precedence.
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Vaccine array.
 *   post:
 *     summary: Add to vaccine catalog
 *     description: Creates a new vaccine master entry for this gaushala.
 *     tags: [Health Service]
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
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 example: Brucellosis Vaccine
 *     responses:
 *       201:
 *         description: Master entry created.
 *       400:
 *         $ref: '#/components/schemas/ValidationErrorResponse'
 */

// ───────────────────────── Medical Records ─────────────────────────

/**
 * @swagger
 * /api/health/medical:
 *   post:
 *     summary: Record medical encounter
 *     description: Documents a physical checkup or illness treatment. Updates the animal's internal health flags.
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicalRecord'
 *     responses:
 *       201:
 *         description: Encounter archived.
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */

/**
 * @swagger
 * /api/health/medical/{id}:
 *   patch:
 *     summary: Update medical record
 *     description: Modifies symptoms, treatment, or vet details for an existing record.
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: mongo-id
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicalRecord'
 *     responses:
 *       200:
 *         description: Changes saved.
 *       400:
 *         $ref: '#/components/schemas/ValidationErrorResponse'
 */

/**
 * @swagger
 * /api/health/medical/animal/{animalId}:
 *   get:
 *     summary: Animal health history
 *     description: Retrieves all medical/encounter records for a specific animal.
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: path
 *         name: animalId
 *         required: true
 *         schema:
 *           type: string
 *           format: mongo-id
 *     responses:
 *       200:
 *         description: History retrieved.
 *
 * /api/health/medical/sick:
 *   get:
 *     summary: List currently sick animals
 *     description: Retrieves all animals whose most recent medical record indicates a 'SICK' status.
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: List of sick animals retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       animal:
 *                         type: object
 *                         properties:
 *                           id: { type: string }
 *                           name: { type: string }
 *                           tagNumber: { type: string }
 *                           photoUrl: { type: string }
 *                       visitDate: { type: string, format: date-time }
 *                       disease: { type: string }
 *                       symptoms: { type: string }
 *                       medicalStatus: { type: string, enum: [SICK] }
 */

// ───────────────────────── Vaccination ─────────────────────────

/**
 * @swagger
 * /api/health/vaccination:
 *   post:
 *     summary: Log a vaccination dose
 *     description: Registers a specific dose against an animal and the global vaccine catalog.
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VaccinationRecord'
 *     responses:
 *       201:
 *         description: Dose documented.
 *       400:
 *         $ref: '#/components/schemas/ValidationErrorResponse'
 */

/**
 * @swagger
 * /api/health/vaccination/{id}:
 *   patch:
 *     summary: Adjust vaccination record
 *     description: Updates dose type or remarks for an existing vaccination entry.
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: mongo-id
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VaccinationRecord'
 *     responses:
 *       200:
 *         description: Updated.
 *       400:
 *         $ref: '#/components/schemas/ValidationErrorResponse'
 */

/**
 * @swagger
 * /api/health/vaccination/animal/{animalId}:
 *   get:
 *     summary: Vaccination timeline
 *     description: Retrieves all doses and booster shots recorded for an animal.
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: path
 *         name: animalId
 *         required: true
 *         schema:
 *           type: string
 *           format: mongo-id
 *     responses:
 *       200:
 *         description: Timeline array.
 */

// ───────────────────────── Deworming ─────────────────────────

/**
 * @swagger
 * /api/health/deworming:
 *   get:
 *     summary: List all deworming actions
 *     description: Retrieves a global list of recent deworming records in the gaushala.
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Global list.
 *   post:
 *     summary: Individual deworming
 *     description: Records a single deworming treatment for one animal.
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DewormingRecord'
 *     responses:
 *       201:
 *         description: Dose recorded.
 *       400:
 *         $ref: '#/components/schemas/ValidationErrorResponse'
 */

/**
 * @swagger
 * /api/health/deworming/bulk:
 *   post:
 *     summary: Batch deworming
 *     description: Efficiently records a shared deworming event for a group of animals.
 *     tags: [Health Service]
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
 *             required: [animalIds, doseDate, doseType]
 *             properties:
 *               animalIds:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                   format: mongo-id
 *                 description: Subset of animal IDs treated.
 *               doseDate:
 *                 type: string
 *                 format: date
 *               doseType:
 *                 type: string
 *                 enum: [INJECTION, TABLET]
 *               companyName:
 *                 type: string
 *               quantity:
 *                 type: string
 *               vetId:
 *                 type: string
 *                 format: mongo-id
 *               nextDoseDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: All individual records created atomically.
 *       400:
 *         $ref: '#/components/schemas/ValidationErrorResponse'
 */

/**
 * @swagger
 * /api/health/deworming/{id}:
 *   patch:
 *     summary: Adjust deworming record
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: mongo-id
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DewormingRecord'
 *     responses:
 *       200:
 *         description: Corrected.
 *       400:
 *         $ref: '#/components/schemas/ValidationErrorResponse'
 */

/**
 * @swagger
 * /api/health/deworming/animal/{animalId}:
 *   get:
 *     summary: Animal Deworming History
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: animalId
 *         required: true
 *         schema:
 *           type: string
 *           format: mongo-id
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Personal history.
 */

// ───────────────────────── Reports ─────────────────────────

/**
 * @swagger
 * /api/health/reports/deworming:
 *   get:
 *     summary: Deworming Report (Date-wise or Animal-wise)
 *     description: "Returns deworming records with cow identity. Fields: photo, name, tagno, animalNo, doseDate, companyName, doctorName, lastDoseDate, nextDoseDate, quantity, doseType."
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: animalId
 *         description: Optional ID for animal-wise report.
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: List of deworming records with identity.
 */

/**
 * @swagger
 * /api/health/reports/deworming/dropdown:
 *   get:
 *     summary: Animal Select for Report
 *     description: Returns animals filtered by type (COW/BULL) for the report dropdown.
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [COW, BULL] }
 *     responses:
 *       200:
 *         description: List of animal identities.
 */

/**
 * @swagger
 * /api/health/reports/medical:
 *   get:
 *     summary: Medical Report (Animal-wise, Date-wise, or Disease-wise)
 *     description: "Returns detailed medical history. Fields: photo, name, tagno, animalNo, medicalStatus, visitType, disease, doctorName, visitDate."
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: animalId
 *         description: Filter by specific animal.
 *       - in: query
 *         name: diseaseId
 *         description: Filter by specific disease.
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: List of medical records with clinical details.
 */

/**
 * @swagger
 * /api/health/reports/vaccine:
 *   get:
 *     summary: Vaccine Report (Animal-wise, Date-wise, or Vaccine-wise)
 *     description: "Returns vaccination records. Fields: photo, name, tagno, animalNo, vaccine, doseDate, remark, dosetype."
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: animalId
 *         description: Filter by specific animal.
 *       - in: query
 *         name: vaccineId
 *         description: Filter by specific vaccine.
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: List of vaccination records with dose details.
 */

/**
 * @swagger
 * /api/health/reports/lab:
 *   get:
 *     summary: Lab Test Report (Animal-wise, Date-wise, or Test-wise)
 *     description: "Returns diagnostic laboratory details. Fields: photo, name, tagno, animalNo, labtestName, sampleDate, resultDate, Remark."
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: animalId
 *         description: Filter by specific animal.
 *       - in: query
 *         name: labtestId
 *         description: Filter by specific lab test type.
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: List of lab records with clinical details.
 */

// ───────────────────────── Lab Testing ─────────────────────────

/**
 * @swagger
 * /api/health/lab/master:
 *   get:
 *     summary: List Lab Test Types
 *     description: Returns the list of available lab tests. Returns common lab tests (system-wide) merged with gaushala-specific records. If a gaushala-specific lab test has the same name as a common one, the gaushala-specific version takes precedence.
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: List of lab test masters.
 *   post:
 *     summary: Add Lab Test Type
 *     description: Creates a new lab test type for the gaushala.
 *     tags: [Health Service]
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
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "Milk Analysis" }
 *     responses:
 *       201:
 *         description: Lab test type created.
 *
 * /api/health/lab/master/{id}:
 *   delete:
 *     summary: Delete Lab Test Type
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Lab test type deleted.
 */

/**
 * @swagger
 * /api/health/lab:
 *   get:
 *     summary: List Lab Records
 *     description: Returns a list of all clinical lab results, optionally filtered by animal.
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: animalId
 *     responses:
 *       200:
 *         description: List of lab records.
 *   post:
 *     summary: Create Lab Record
 *     tags: [Health Service]
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
 *             required: [animalId, labtestId, sampleDate]
 *             properties:
 *               animalId: { type: string }
 *               labtestId: { type: string }
 *               sampleDate: { type: string, format: date }
 *               resultDate: { type: string, format: date }
 *               result: { type: string, enum: ["POSITIVE", "NEGATIVE"] }
 *               attachmentUrl: { type: string, format: binary }
 *               remark: { type: string }
 *     responses:
 *       201:
 *         description: Lab record created.
 *
 * /api/health/lab/{id}:
 *   put:
 *     summary: Update Lab Record
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               labtestId: { type: string }
 *               sampleDate: { type: string, format: date }
 *               resultDate: { type: string, format: date }
 *               result: { type: string, enum: ["POSITIVE", "NEGATIVE"] }
 *               attachmentUrl: { type: string, format: binary }
 *               remark: { type: string }
 *     responses:
 *       200:
 *         description: Lab record updated.
 *   delete:
 *     summary: Delete Lab Record
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Lab record deleted.
 */

// ───────────────────────── Unified Timeline ─────────────────────────

/**
 * @swagger
 * /api/health/timeline/animal/{animalId}:
 *   get:
 *     summary: Integrated Health Passport
 *     description: "Returns a chronological merged feed of ALL health interactions: Medical visits, Vaccinations, and Deworming doses."
 *     tags: [Health Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: animalId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: mongo-id
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Full chronological health timeline.
 */

/**
 * @swagger
 * components:
 *   parameters:
 *
 *   responses:
 *     UnauthorizedError:
 *       description: Missing or invalid token.
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
