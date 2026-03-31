/**
 * @swagger
 * tags:
 *   - name: Breeding Service
 *     description: Animal breeding lifecycle management, including heat records, dry-off periods, and conception journeys.
 *
 * components:
 *   schemas:
 *     HeatRecord:
 *       type: object
 *       description: Documentation of an animal's heat event and breeding attempt.
 *       required: [animalId, date, breedingType]
 *       properties:
 *         id:
 *           type: string
 *         animalId:
 *           type: string
 *           format: mongo-id
 *           description: ID of the cow in heat.
 *         date:
 *           type: string
 *           format: date
 *           description: Date and time when the heat was observed.
 *         breedingType:
 *           type: string
 *           enum: [NATURAL, AI]
 *           description: "AI: Artificial Insemination, NATURAL: Bull breeding."
 *         note:
 *           type: string
 *           description: Additional remarks or observations.
 *
 *     DryOffRecord:
 *       type: object
 *       description: Record of when a cow stopped giving milk (Dry-off period).
 *       required: [animalId, date, reason]
 *       properties:
 *         id:
 *           type: string
 *         animalId:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         reason:
 *           type: string
 *           enum: [ILLNESS, LOW_YIELD, MEDICATED, OTHER]
 *         remarks:
 *           type: string
 *
 *     ConceptionJourney:
 *       type: object
 *       description: Master record for a single pregnancy lifecycle from conception to delivery.
 *       required: [animalId, conceiveDate, pregnancyType]
 *       properties:
 *         id:
 *           type: string
 *         animalId:
 *           type: string
 *         conceiveDate:
 *           type: string
 *           format: date
 *           description: Starting date of the conception period.
 *         pregnancyType:
 *           type: string
 *           enum: [NATURAL, AI]
 *         bullId:
 *           type: string
 *           format: mongo-id
 *           description: Reference to the bull (if internal).
 *         bullName:
 *           type: string
 *         bullTag:
 *           type: string
 *         serialNumber:
 *           type: string
 *         companyName:
 *           type: string
 *         currentStage:
 *           type: string
 *           enum: [INITIATED, PD_CONFIRMED, DRY_OFF, DELIVERED, ABORTED]
 *           description: Tracks the progress of the pregnancy.
 *         pdResult:
 *           type: boolean
 *           description: Result of the Pregnancy Diagnosis check.
 *         pdDate:
 *           type: string
 *           format: date
 *         dryOffDate:
 *           type: string
 *           format: date
 *         deliveryDate:
 *           type: string
 *           format: date
 *
 *     ParityRecord:
 *       type: object
 *       description: Historical record of a specific past parity (calving event).
 *       required: [animalId, parityNo, deliveryDate, pregnancyDate]
 *       properties:
 *         id:
 *           type: string
 *         animalId:
 *           type: string
 *         parityNo:
 *           type: integer
 *           minimum: 1
 *           description: Sequence number of the birth (e.g. 1st calf, 2nd calf).
 *         pregnancyDate:
 *           type: string
 *           format: date
 *         deliveryDate:
 *           type: string
 *           format: date
 *         pregnancyType:
 *           type: string
 *           enum: [NATURAL, AI]
 *         bullId:
 *           type: string
 *           format: mongo-id
 *         bullName:
 *           type: string
 *         cowPhoto:
 *           type: string
 *         dryOffDate:
 *           type: string
 *           format: date
 *         note:
 *           type: string
 */

// ───────────────────────── Media ─────────────────────────

/**
 * @swagger
 * /api/breeding/media/presigned-url:
 *   get:
 *     summary: Get upload URL for breeding media
 *     description: Provides a temporary link for uploading pregnancy or delivery photos.
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fileName
 *         required: true
 *       - in: query
 *         name: fileType
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Presigned URL generated.
 */

// ───────────────────────── Heat ─────────────────────────

/**
 * @swagger
 * /api/breeding/heat:
 *   post:
 *     summary: Record heat observation
 *     description: Registers a new heat event. Updates the animal's breeding status tokens.
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HeatRecord'
 *     responses:
 *       201:
 *         description: Event recorded.
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   get:
 *     summary: Animal heat history
 *     description: Lists all past heat records for a specific animal.
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: animalId
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: List of records.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/breeding/heat/eligible:
 *   get:
 *     summary: Animals ready for heat
 *     description: Returns a list of cows eligible for a new heat record.
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: List of animals.
 */

/**
 * @swagger
 * /api/breeding/heat/{id}:
 *   patch:
 *     summary: Update heat entry
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HeatRecord'
 *     responses:
 *       200:
 *         description: Updated.
 *       400:
 *         $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   delete:
 *     summary: Remove heat record
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Deleted.
 */

// ───────────────────────── Reports ─────────────────────────

/**
 * @swagger
 * /api/breeding/reports/heat:
 *   get:
 *     summary: Heat Record Report
 *     description: Returns heat observations with cow identity details (photo, tag, etc.). Supports animal-wise or date-wise filtering.
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: animalId
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Heat report list. Fields include breedingType (NATURAL, AI).
 */

/**
 * @swagger
 * /api/breeding/reports/pregnancy:
 *   get:
 *     summary: Pregnancy Record Report
 *     description: Returns active or pending pregnancies (Date-wise). Includes identity, totalDays (since conception), parity, and breedingType (NATURAL, AI).
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Pregnancy report list with totalCount.
 */

/**
 * @swagger
 * /api/breeding/reports/delivery:
 *   get:
 *     summary: Delivery Record Report
 *     description: Returns completed deliveries with calfStatus (ALIVE, DEAD, ABORTED) and calfGender (MALE, FEMALE) details.
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Delivery report list with totalCount.
 */

/**
 * @swagger
 * /api/breeding/reports/parity/dropdown:
 *   get:
 *     summary: Animals for Parity Report
 *     description: Returns a list of all active female animals for the parity report selection dropdown.
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Animal identity list.
 */

// ───────────────────────── Dry-Off ─────────────────────────

/**
 * @swagger
 * /api/breeding/dry-off:
 *   post:
 *     summary: Mark animal as Dry
 *     description: Records a dry-off period for a cow for non-pregnancy related reasons (illness, low yield, etc.).
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DryOffRecord'
 *     responses:
 *       201:
 *         description: Status updated.
 *       400:
 *         $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   get:
 *     summary: List dry-off records
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, pregnant, other]
 *         description: Filter records by type. Defaults to 'all'.
 *     responses:
 *       200:
 *         description: List of dry-off records retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       animalId:
 *                         type: string
 *                       animalName:
 *                         type: string
 *                       tagNumber:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/breeding/dry-off/eligible:
 *   get:
 *     summary: Get Cows Eligible for Regular Dry-off
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: List of eligible animals retrieved successfully.
 */

/**
 * @swagger
 * /api/breeding/dry-off/{id}:
 *   patch:
 *     summary: Correct dry-off record
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DryOffRecord'
 *     responses:
 *       200:
 *         description: Corrected.
 *       400:
 *         $ref: '#/components/schemas/ValidationErrorResponse'
 *   delete:
 *     summary: Remove dry-off record
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Record removed.
 */

// ───────────────────────── Parity ─────────────────────────

/**
 * @swagger
 * /api/breeding/parity:
 *   post:
 *     summary: Add historical parity
 *     description: Manually adds a past birth record for historical tracking.
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParityRecord'
 *     responses:
 *       201:
 *         description: Record added.
 */

/**
 * @swagger
 * /api/breeding/parity/{animalId}:
 *   get:
 *     summary: Full birth history (Parity Report)
 *     description: Returns a comprehensive list of all past birth events, combining historical manual entries and completed conception journeys. Includes photo, status, and gender details.
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: animalId
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Sorted parity timeline (Newest first).
 */

/**
 * @swagger
 * /api/breeding/parity/{id}:
 *   patch:
 *     summary: Update parity record
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParityRecord'
 *     responses:
 *       200:
 *         description: Parity entry updated.
 */

// ───────────────────────── Conception Journey ─────────────────────────

/**
 * @swagger
 * /api/breeding/journey/initiate:
 *   post:
 *     summary: Start a new pregnancy lifecycle
 *     description: "Initializes a journey. Updates cow status to 'isPregnant: true' and 'isHeifer: false'."
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConceptionJourney'
 *             required: [animalId, conceiveDate, pregnancyType]
 *     responses:
 *       201:
 *         description: Journey started.
 *       400:
 *         description: Cow already in an active journey or validation error.
 */

/**
 * @swagger
 * /api/breeding/journey/list:
 *   get:
 *     summary: List all active journeys
 *     description: Returns a global view of current pregnancies in the gaushala.
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Progress list.
 */

/**
 * @swagger
 * /api/breeding/journey/eligible-cows:
 *   get:
 *     summary: Get Eligible Cows for Journeys
 *     description: Returns cows that are currently NOT in an active pregnancy journey and are of breeding age.
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: List of cows.
 */

/**
 * @swagger
 * /api/breeding/journey/eligible-dry-off:
 *   get:
 *     summary: Get Cows for Journey Dry-off
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Eligible cows list.
 */

/**
 * @swagger
 * /api/breeding/journey/{id}:
 *   get:
 *     summary: Journey Status Details
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Multi-stage breakdown.
 *   put:
 *     summary: Correct initiation details
 *     description: Allows fixing date/type after a journey has started.
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConceptionJourney'
 *     responses:
 *       200:
 *         description: Corrected.
 *   delete:
 *     summary: Cancel pregnancy journey
 *     description: Removes the journey record and resets cow's pregnancy status.
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Journey terminated.
 */

/**
 * @swagger
 * /api/breeding/journey/{id}/confirm:
 *   patch:
 *     summary: Confirm pregnancy (PD)
 *     description: Documents the results of the Pregnancy Diagnosis. If `pdResult` is false, the journey ends as ABORTED.
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pdResult, pdDate]
 *             properties:
 *               pdResult:
 *                 type: boolean
 *               pdDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Result saved.
 */

/**
 * @swagger
 * /api/breeding/journey/{id}/dry-off:
 *   patch:
 *     summary: Record journey dry-off
 *     description: Links a dry-off date to the active pregnancy journey.
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [dryOffDate]
 *             properties:
 *               dryOffDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Stage updated to DRY_OFF.
 */

/**
 * @swagger
 * /api/breeding/journey/{id}/deliver:
 *   patch:
 *     summary: Record birth and close journey
 *     description: "CRITICAL: This atomic operation records the delivery outcome, increments the cow's parity, updates isPregnant/isLactating, and automatically registers the new calf. If calfStatus is ALIVE, calfName and calfTagNumber are required."
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deliveryDate, calfStatus, calfGender]
 *             properties:
 *               deliveryDate:
 *                 type: string
 *                 format: date
 *               calfStatus:
 *                 type: string
 *                 enum: [ALIVE, DEAD, ABORTED]
 *               calfGender:
 *                 type: string
 *                 enum: [MALE, FEMALE]
 *               calfName:
 *                 type: string
 *               calfTagNumber:
 *                 type: string
 *               calfBreed:
 *                 type: string
 *                 enum: [Gir, Sahiwal, Red_Sindhi, Tharparkar, Kankrej, Rathi, Punganur, Badri, Hallikar, Kangayam, Hariana, Mewati, Nagori, Nimadi, Malvi, Kherigarh, Amritmahal, Umblachery, Pulikulam, Bargur, Ongole, Red_Kandhari, Gaolao, Gangatiri, Siri, Motu, Vechur, Jersey, Holstein_Friesian, Brown_Swiss]
 *               calfGroup:
 *                 type: string
 *               calfAppearance:
 *                 type: string
 *               calfWeight:
 *                 type: number
 *               deliveryPhoto:
 *                 type: string
 *               calfPhoto:
 *                 type: string
 *     responses:
 *       201:
 *         description: Delivery recorded and calf registered successfully.
 */

// ───────────────────────── Lineage / Helpers ─────────────────────────

/**
 * @swagger
 * /api/breeding/bulls/eligible:
 *   get:
 *     summary: Get Breeding Bulls
 *     description: Returns a list of bulls available for breeding selection, filtered by pregnancy type.
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: pregnancyType
 *         schema:
 *           type: string
 *           enum: [AI, NATURAL]
 *         description: Filter bulls by pregnancy type. AI returns AI bulls, NATURAL returns Gaushala bulls.
 *     responses:
 *       200:
 *         description: List of bulls for dropdown.
 */

/**
 * @swagger
 * /api/breeding/lineage/{id}:
 *   get:
 *     summary: Get children list
 *     description: Retrieves all registered calves birthed by the specified animal.
 *     tags: [Breeding Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Children profiles.
 */
