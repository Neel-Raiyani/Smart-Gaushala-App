/**
 * @swagger
 * tags:
 *   - name: Animal Service
 *     description: Comprehensive cattle management including health profiles, birth records, disposal tracking, and specialized reporting.
 *
 * components:
 *   schemas:
 *     Animal:
 *       type: object
 *       required: [id, name, tagNumber, gender, parity, birthDate, acquisitionType, status]
 *       description: Detailed profile of a bovine animal within the gaushala.
 *       properties:
 *         id:
 *           type: string
 *           example: '65d1234567890abcdef12345'
 *           description: Unique internal identifier (MongoDB ObjectId).
 *         name:
 *           type: string
 *           minLength: 1
 *           example: 'Laxmi'
 *           description: Name assigned to the animal.
 *         tagNumber:
 *           type: string
 *           example: 'TAG123'
 *           description: Physical tag number attached to the animal for identification.
 *         animalNumber:
 *           type: string
 *           example: 'C001'
 *           description: Internal gaushala serial number or sequence.
 *         gender:
 *           type: string
 *           enum: [MALE, FEMALE]
 *           example: FEMALE
 *           description: Biological gender of the animal.
 *         cowBreed:
 *           type: string
 *           enum: [Gir, Sahiwal, Red_Sindhi, Tharparkar, Kankrej, Rathi, Punganur, Badri, Hallikar, Kangayam, Hariana, Mewati, Nagori, Nimadi, Malvi, Kherigarh, Amritmahal, Umblachery, Pulikulam, Bargur, Ongole, Red_Kandhari, Gaolao, Gangatiri, Siri, Motu, Vechur, Jersey, Holstein_Friesian, Brown_Swiss]
 *           example: Gir
 *           description: Breed designation.
 *         cowGroupId:
 *           type: string
 *           format: mongo-id
 *           example: '507f1f77bcf86cd799439011'
 *           description: ObjectId reference to a CowGroup record.
 *         birthDate:
 *           type: string
 *           format: date
 *           description: Mandatory birth date (ISO 8601). Crucial for age and maturity calculations.
 *         adultDate:
 *           type: string
 *           format: date
 *           description: Read-only; Automatically calculated date (Birth date + 12 months) when treated as an adult.
 *         isPregnant:
 *           type: boolean
 *           description: Read-only; synced from Breeding service.
 *         isLactating:
 *           type: boolean
 *           description: Indicates if the cow is currently giving milk.
 *         isDryOff:
 *           type: boolean
 *           description: Indicates if the cow is in a dry period (not producing milk).
 *         isHeifer:
 *           type: boolean
 *           description: A young female cow that has not yet had a calf. Under 1 year OR no pregnancy history.
 *         isRetired:
 *           type: boolean
 *           description: Marks animals that are removed from breeding/production cycles.
 *         retiredDate:
 *           type: string
 *           format: date
 *           description: The date when the animal was officially retired.
 *         parity:
 *           type: integer
 *           minimum: 0
 *           description: Number of times the cow has given birth.
 *         bullType:
 *           type: string
 *           enum: [GAUSHALA, AI]
 *           description: Type of bull — GAUSHALA (resident) or AI (artificial insemination). Null for females.
 *         bullView:
 *           type: string
 *           description: Specific breeding classification or characteristics for bulls.
 *         motherMilk:
 *           type: number
 *           minimum: 0
 *           description: Historical dairy performance of the animal's mother (in Liters).
 *         grandmotherMilk:
 *           type: number
 *           minimum: 0
 *           description: Historical dairy performance of the animal's grandmother (in Liters).
 *         isHandicapped:
 *           type: boolean
 *           description: Indicates physical impairment.
 *         handicapReason:
 *           type: string
 *           description: Brief explanation of the disability.
 *         isUdderClosedFL:
 *           type: boolean
 *           description: Front-Left udder quarter status.
 *         isUdderClosedFR:
 *           type: boolean
 *           description: Front-Right udder quarter status.
 *         isUdderClosedBL:
 *           type: boolean
 *           description: Back-Left udder quarter status.
 *         isUdderClosedBR:
 *           type: boolean
 *           description: Back-Right udder quarter status.
 *         acquisitionType:
 *           type: string
 *           enum: [BIRTH, PURCHASE, DONATION]
 *           example: PURCHASE
 *           description: Source of entry into the gaushala.
 *         purchaseDate:
 *           type: string
 *           format: date
 *           description: Required if acquired via PURCHASE (ISO 8601).
 *         purchasedFrom:
 *           type: string
 *           description: Vendor or location of purchase.
 *         purchasePrice:
 *           type: number
 *           minimum: 0
 *           example: 45000
 *           description: Financial cost in local currency.
 *         ownerName:
 *           type: string
 *           description: Previous owner's name for documentation.
 *         ownerMobile:
 *           type: string
 *           description: Contact number of the previous owner.
 *         motherName:
 *           type: string
 *           description: Name of the animal's mother (for lineage tracking).
 *         fatherName:
 *           type: string
 *           description: Name of the animal's father (for lineage tracking).
 *         motherId:
 *           type: string
 *           format: mongo-id
 *           description: Reference to the mother's profile (if registered in the system).
 *         fatherId:
 *           type: string
 *           format: mongo-id
 *           description: Reference to the father's profile (if registered in the system).
 *         status:
 *           type: string
 *           enum: [ACTIVE, SOLD, DEAD, DONATED]
 *           example: ACTIVE
 *           description: Lifecycle availability. Managed via registration and disposal endpoints.
 *         photoUrl:
 *           type: string
 *           description: Internal storage key for the primary image.
 *         viewUrl:
 *           type: string
 *           format: url
 *           description: Secure temporary link for UI rendering.
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Read-only soft-deletion flag.
 *
 *     AnimalSummary:
 *       type: object
 *       properties:
 *         cows:
 *           type: object
 *           properties:
 *             total: { type: integer }
 *             heifer: { type: integer }
 *             pregnant: { type: integer }
 *             lactating: { type: integer }
 *             dryOff: { type: integer }
 *             retired: { type: integer }
 *         bulls:
 *           type: object
 *           properties:
 *             total: { type: integer }
 *             calf: { type: integer }
 *             retired: { type: integer }
 *
 *     SellRecord:
 *       type: object
 *       required: [animalId, buyer, mobileNumber, amount]
 *       properties:
 *         animalId: { type: string, format: mongo-id }
 *         buyer: { type: string }
 *         mobileNumber: { type: string, example: '9988776655' }
 *         city: { type: string }
 *         amount: { type: number, minimum: 0 }
 *         referenceBy: { type: string }
 *         photoUrl: { type: string, format: binary }
 *         soldAt: { type: string, format: date }
 *
 *     DeathRecord:
 *       type: object
 *       required: [animalId, dateOfDeath, reason]
 *       properties:
 *         animalId: { type: string, format: mongo-id }
 *         dateOfDeath: { type: string, format: date }
 *         reason: { type: string }
 *         lastPhotoUrl: { type: string }
 *
 *     DonationRecord:
 *       type: object
 *       required: [animalId, gaushalaName, mobileNumber]
 *       properties:
 *         animalId: { type: string, format: mongo-id }
 *         gaushalaName: { type: string }
 *         mobileNumber: { type: string, example: '9988776655' }
 *         referenceBy: { type: string }
 *         photoUrl: { type: string, format: binary }
 *         donatedAt: { type: string, format: date }
 *
 *     AnimalCreateInput:
 *       type: object
 *       required: [name, tagNumber, gender, parity, birthDate, acquisitionType]
 *       description: Fields required or optional when registering a new animal. Internal fields (id, adultDate, status) are excluded.
 *       properties:
 *         name: { type: string, minLength: 1, example: 'Laxmi' }
 *         tagNumber: { type: string, example: 'TAG123' }
 *         animalNumber: { type: string, example: 'C001' }
 *         gender: { type: string, enum: [MALE, FEMALE], example: FEMALE }
 *         cowBreed: { type: string, enum: [Gir, Sahiwal, Red_Sindhi, Tharparkar, Kankrej, Rathi, Punganur, Badri, Hallikar, Kangayam, Hariana, Mewati, Nagori, Nimadi, Malvi, Kherigarh, Amritmahal, Umblachery, Pulikulam, Bargur, Ongole, Red_Kandhari, Gaolao, Gangatiri, Siri, Motu, Vechur, Jersey, Holstein_Friesian, Brown_Swiss], example: Gir }
 *         cowGroupId: { type: string, format: mongo-id, description: 'ObjectId reference to CowGroup' }
 *         birthDate: { type: string, format: date, example: '2023-01-01' }
 *         parity: { type: integer, minimum: 0, default: 0 }
 *         bullType: { type: string, enum: [GAUSHALA, AI], description: 'Null for females' }
 *         bullView: { type: string }
 *         motherMilk: { type: number, minimum: 0 }
 *         grandmotherMilk: { type: number, minimum: 0 }
 *         isHandicapped: { type: boolean, default: false }
 *         handicapReason: { type: string }
 *         acquisitionType: { type: string, enum: [BIRTH, PURCHASE, DONATION], example: PURCHASE }
 *         purchaseDate: { type: string, format: date }
 *         purchasedFrom: { type: string }
 *         purchasePrice: { type: number, minimum: 0 }
 *         ownerName: { type: string }
 *         ownerMobile: { type: string }
 *         photoUrl: { type: string, description: 'Internal storage key for photo' }
 *         isUdderClosedFL: { type: boolean, default: false }
 *         isUdderClosedFR: { type: boolean, default: false }
 *         isUdderClosedBL: { type: boolean, default: false }
 *         isUdderClosedBR: { type: boolean, default: false }
 *         motherName: { type: string }
 *         fatherName: { type: string }
 *         motherId: { type: string, format: mongo-id }
 *         fatherId: { type: string, format: mongo-id }
 *
 *     AnimalUpdateInput:
 *       type: object
 *       description: Fields allowed for updating an animal profile. All fields are optional. Logic-driven fields (adultDate) remain excluded.
 *       properties:
 *         name: { type: string, minLength: 1 }
 *         tagNumber: { type: string }
 *         animalNumber: { type: string }
 *         gender: { type: string, enum: [MALE, FEMALE] }
 *         cowBreed: { type: string, enum: [Gir, Sahiwal, Red_Sindhi, Tharparkar, Kankrej, Rathi, Punganur, Badri, Hallikar, Kangayam, Hariana, Mewati, Nagori, Nimadi, Malvi, Kherigarh, Amritmahal, Umblachery, Pulikulam, Bargur, Ongole, Red_Kandhari, Gaolao, Gangatiri, Siri, Motu, Vechur, Jersey, Holstein_Friesian, Brown_Swiss] }
 *         cowGroupId: { type: string, format: mongo-id }
 *         birthDate: { type: string, format: date }
 *         parity: { type: integer, minimum: 0 }
 *         bullView: { type: string }
 *         motherMilk: { type: number, minimum: 0 }
 *         grandmotherMilk: { type: number, minimum: 0 }
 *         isHandicapped: { type: boolean }
 *         handicapReason: { type: string }
 *         acquisitionType: { type: string, enum: [BIRTH, PURCHASE, DONATION] }
 *         purchaseDate: { type: string, format: date }
 *         purchasedFrom: { type: string }
 *         purchasePrice: { type: number, minimum: 0 }
 *         ownerName: { type: string }
 *         ownerMobile: { type: string }
 *         photoUrl: { type: string }
 *         isUdderClosedFL: { type: boolean }
 *         isUdderClosedFR: { type: boolean }
 *         isUdderClosedBL: { type: boolean }
 *         isUdderClosedBR: { type: boolean }
 *         motherName: { type: string }
 *         fatherName: { type: string }
 *         motherId: { type: string, format: mongo-id }
 *         fatherId: { type: string, format: mongo-id }
 */

// ───────────────────────── Groups ─────────────────────────

/**
 * @swagger
 * /api/animal/groups:
 *   get:
 *     summary: List logical groups
 *     description: Returns only the names of all unique logical groups currently in use within the gaushala.
 *     tags: [Animal Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Unique group name array.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 groups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       name: { type: string }
 *   post:
 *     summary: Create new cow group
 *     description: Manually adds a new group name to the selection list.
 *     tags: [Animal Service]
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
 *                 example: 'High Producers'
 *     responses:
 *       201:
 *         description: Group created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Group created' }
 *                 group: { type: object }
 *       400:
 *         $ref: '#/components/schemas/ValidationErrorResponse'
 *       409:
 *         description: Group name already exists.
 */

/**
 * @swagger
 * /api/animal/groups/{id}:
 *   patch:
 *     summary: Rename group
 *     tags: [Animal Service]
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
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *     responses:
 *       200:
 *         description: Group renamed successfully.
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Delete group
 *     tags: [Animal Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Group deleted successfully.
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */

// ───────────────────────── Reports ─────────────────────────

/**
 * @swagger
 * /api/animal/reports/summary:
 *   get:
 *     summary: Get gaushala status summary
 *     description: Returns counts of animals partitioned by various biological and production statuses (Heifer, Pregnant, etc.).
 *     tags: [Animal Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Detailed counts summary.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnimalSummary'
 */

/**
 * @swagger
 * /api/animal/reports/udder-close:
 *   get:
 *     summary: List cows with udder quarter issues
 *     description: Filters active cows based on the number of non-functional (closed) udder quarters. Returns minimized data.
 *     tags: [Animal Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: quarterCount
 *         schema:
 *           type: string
 *           enum: [all, 1, 2, 3, 4]
 *           default: all
 *         description: Number of closed quarters to filter by.
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Filtered cow list.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 cows:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Animal' }
 */

/**
 * @swagger
 * /api/animal/reports/eligible-retirement:
 *   get:
 *     summary: Get animals ready for retirement
 *     description: Returns a list of all active cows and bulls that are NOT yet retired and do NOT have an active pregnancy journey. Lactating cows ARE included.
 *     tags: [Animal Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [MALE, FEMALE]
 *     responses:
 *       200:
 *         description: Dropdown data list.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 animals:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Animal' }
 */

/**
 * @swagger
 * /api/animal/reports/retire:
 *   post:
 *     summary: Officially retire an animal
 *     description: Marks an animal as retired. Updates 'isRetired' to true, records the retirement date, and resets production/pregnancy flags.
 *     tags: [Animal Service]
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
 *             required: [animalId, retiredDate]
 *             properties:
 *               animalId:
 *                 type: string
 *                 format: mongo-id
 *               retiredDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Animal status updated to retired.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Animal status updated to retired' }
 *
 * /api/animal/reports/export/cows:
 *   get:
 *     summary: Export Cow Report (Excel)
 *     description: |
 *       Generates an Excel file containing Cow data with phase-wise information.
 *       Included Fields: Cow Name, Tag No., Cow No., Breed, Category (Group), Phase (Lactating/Heifer/etc.), Age, 
 *       Mother Milk, Grandmother Milk, Parity, Udder Status (Quarters), Acquisition Type, and Price/Owner info.
 *     tags: [Animal Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, lactating, heifer, pregnant, dryoff, retired, handicapped, calves]
 *       - in: query
 *         name: search
 *     responses:
 *       200:
 *         description: Excel file.
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *
 * /api/animal/reports/export/bulls:
 *   get:
 *     summary: Export Bull Report (Excel)
 *     description: |
 *       Generates an Excel file containing Bull data.
 *       Included Fields: Bull Name, Tag No., Breed, Age, Bull View (Breeding Class), Acquisition Type, and Price/Owner info.
 *     tags: [Animal Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, retired, calf]
 *       - in: query
 *         name: search
 *     responses:
 *       200:
 *         description: Excel file.
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */

// ───────────────────────── Disposal ─────────────────────────

/**
 * @swagger
 * /api/animal/sell:
 *   post:
 *     summary: Sell an animal
 *     description: Records a sale and marks the animal status as SOLD.
 *     tags: [Animal Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SellRecord'
 *     responses:
 *       201:
 *         description: Record saved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Record saved' }
 */

/**
 * @swagger
 * /api/animal/death:
 *   post:
 *     summary: Mark animal as dead
 *     description: Records the death and marks the animal status as DEAD.
 *     tags: [Animal Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeathRecord'
 *     responses:
 *       201:
 *         description: Record saved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Record saved' }
 */

/**
 * @swagger
 * /api/animal/donation:
 *   post:
 *     summary: Document donation
 *     description: Records a donation and marks the animal status as DONATED.
 *     tags: [Animal Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DonationRecord'
 *     responses:
 *       201:
 *         description: Record saved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Record saved' }
 */

/**
 * @swagger
 * /api/animal/disposal/{type}/{id}:
 *   patch:
 *     summary: Update disposal history
 *     tags: [Animal Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [sell, death, donation]
 *       - in: path
 *         name: id
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/SellRecord'
 *               - $ref: '#/components/schemas/DeathRecord'
 *               - $ref: '#/components/schemas/DonationRecord'
 *     responses:
 *       200:
 *         description: Record updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Record updated' }
 *   delete:
 *     summary: Remove disposal record
 *     description: Performs a soft delete by setting isActive to false.
 *     tags: [Animal Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [sell, death, donation]
 *       - in: path
 *         name: id
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Record deleted.
 */

/**
 * @swagger
 * /api/animal/disposals:
 *   get:
 *     summary: List disposal history
 *     description: Retrieves a paginated list of animals that were sold, died, or donated. Supports filtering by type and searching by name/tag.
 *     tags: [Animal Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, sell, death, donation]
 *           default: all
 *         description: Filter by specialized disposal event.
 *       - in: query
 *         name: search
 *         description: Search by animal name or tag number.
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of disposal records.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 records:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - $ref: '#/components/schemas/SellRecord'
 *                       - $ref: '#/components/schemas/DeathRecord'
 *                       - $ref: '#/components/schemas/DonationRecord'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 */

// ───────────────────────── Animals ─────────────────────────

/**
 * @swagger
 * /api/animal/add:
 *   post:
 *     summary: Register a new cow or bull
 *     description: Automatically calculates 'adultDate', 'isHeifer', and 'isLactating' based on birthDate and parity.
 *     tags: [Animal Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnimalCreateInput'
 *     responses:
 *       201:
 *         description: Animal registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Animal registered successfully' }
 *                 animal: { $ref: '#/components/schemas/Animal' }
 *       400:
 *         description: Validation error — parity > 0 not allowed for animals younger than 12 months.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorCode: { type: string, example: 'INVALID_PARITY_AGE' }
 *                 message: { type: string, example: 'Parity cannot be greater than 0 for an animal younger than 12 months' }
 */

/**
 * @swagger
 * /api/animal/cows:
 *   get:
 *     summary: Advanced cow search and filtering
 *     description: "Retrieves female animals. Note: Returns minimized data per item (name, tagNo, parity, cowNo, birthDate, adultDate, photoUrl)."
 *     tags: [Animal Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, lactating, heifer, pregnant, dryoff, retired, handicapped, calves]
 *         description: Lifecycle and production state filtering.
 *       - in: query
 *         name: cowGroupId
 *         schema:
 *           type: string
 *           format: mongo-id
 *         description: Filter by cow group ObjectId.
 *       - in: query
 *         name: search
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated cow list.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 cows:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Animal' }
 */

/**
 * @swagger
 * /api/animal/bulls:
 *   get:
 *     summary: List bulls by status
 *     description: "Note: Returns minimized data per item (name, tagNo, birthDate, adultDate, photoUrl)."
 *     tags: [Animal Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, retired, calf]
 *       - in: query
 *         name: cowGroupId
 *         schema:
 *           type: string
 *           format: mongo-id
 *         description: Filter by cow group ObjectId.
 *       - in: query
 *         name: bullType
 *         schema:
 *           type: string
 *           enum: [GAUSHALA, AI]
 *         description: Filter by bull type — GAUSHALA or AI.
 *       - in: query
 *         name: search
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated bull list.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 bulls:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Animal' }
 */

/**
 * @swagger
 * /api/animal/media/presigned-url:
 *   get:
 *     summary: Secure upload URL
 *     tags: [Animal Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fileName
 *         required: true
 *       - in: query
 *         name: contentType
 *         required: true
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [PHOTO, DISPOSAL, DOC]
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Pre-signed URL generated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 uploadUrl: { type: string }
 *                 viewUrl: { type: string }
 */

/**
 * @swagger
 * /api/animal/{id}:
 *   get:
 *     summary: Full animal profile
 *     tags: [Animal Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Animal profile data retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 animal: { $ref: '#/components/schemas/Animal' }
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Soft delete animal
 *     description: Marks an animal as inactive and hard-deletes related service records.
 *     tags: [Animal Service]
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

/**
 * @swagger
 * /api/animal/update/{id}:
 *   patch:
 *     summary: Update profile markers
 *     description: Updating birthDate or parity triggers automatic recalculation of 'adultDate', 'isHeifer', and 'isLactating' unless manually overridden in the same request.
 *     tags: [Animal Service]
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
 *             $ref: '#/components/schemas/AnimalUpdateInput'
 *     responses:
 *       200:
 *         description: Animal updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Animal updated successfully' }
 *                 animal: { $ref: '#/components/schemas/Animal' }
 *       400:
 *         description: Validation error — parity > 0 not allowed for animals younger than 12 months.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorCode: { type: string, example: 'INVALID_PARITY_AGE' }
 *                 message: { type: string, example: 'Parity cannot be greater than 0 for an animal younger than 12 months' }
 */
