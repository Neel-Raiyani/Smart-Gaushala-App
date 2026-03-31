/**
 * @swagger
 * tags:
 *   - name: Alert Service
 *     description: System-driven reminders for animal management.
 */

/**
 * @swagger
 * /api/alert/heat:
 *   get:
 *     summary: Heat alerts
 *     description: Adult cows not observed in heat for 21+ days.
 *     tags: [Alert Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: List of cows due for heat observation.
 */

/**
 * @swagger
 * /api/alert/pregnancy-check:
 *   get:
 *     summary: Pregnancy checking alerts
 *     description: Conception journeys past 60 days without a PD check.
 *     tags: [Alert Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: List of journeys needing pregnancy diagnosis.
 */

/**
 * @swagger
 * /api/alert/insemination:
 *   get:
 *     summary: Insemination alerts
 *     description: Adult cows ready for breeding (not pregnant, not dried off, no active journey, 60+ days post-delivery).
 *     tags: [Alert Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: List of cows eligible for insemination.
 */

/**
 * @swagger
 * /api/alert/delivery:
 *   get:
 *     summary: Delivery alerts
 *     description: Conception journeys approaching 280-day gestation (alerts from day 250).
 *     tags: [Alert Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: List of journeys with expected delivery dates.
 */

/**
 * @swagger
 * /api/alert/deworming:
 *   get:
 *     summary: Deworming alerts
 *     description: Animals with nextDoseDate within 7 days or overdue.
 *     tags: [Alert Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: List of animals due for deworming.
 */

/**
 * @swagger
 * /api/alert/adult:
 *   get:
 *     summary: Adult maturity alerts
 *     description: Animals that have crossed their adultDate (typically 12 months) and are up to 15 months old.
 *     tags: [Alert Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: List of animals in the 12-15 month age bracket.
 */

/**
 * @swagger
 * /api/alert/lab-test:
 *   get:
 *     summary: Pending lab test alerts
 *     description: Lab records that have been sampled but are missing the final result.
 *     tags: [Alert Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: List of lab records with missing results.
 */
/**
 * @swagger
 * /api/alert/vaccination:
 *   get:
 *     summary: Vaccination alerts
 *     description: |
 *       Animals due for vaccination based on the frequency set in the Vaccine Master list.
 *       Alerts appear 7 days before due date, when overdue, or when an animal has never received a required vaccine.
 *     tags: [Alert Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: List of animals due for vaccination.
 */

export { };
