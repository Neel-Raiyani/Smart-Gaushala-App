/**
 * @swagger
 * tags:
 *   - name: Media Service
 *     description: Gaushala-wide photo and video gallery management with virtual folders and S3 integration.
 *
 * components:
 *   schemas:
 *     Folder:
 *       type: object
 *       required: [name, type]
 *       properties:
 *         id:
 *           type: string
 *           description: Folder ID.
 *         name:
 *           type: string
 *           description: Folder name.
 *         type:
 *           type: string
 *           enum: [PHOTO, VIDEO]
 *         itemCount:
 *           type: integer
 *           description: Number of media items in the folder.
 *
 *     GalleryItem:
 *       type: object
 *       required: [folderId, fileName, originalName, mimeType, size]
 *       properties:
 *         id:
 *           type: string
 *         folderId:
 *           type: string
 *         fileName:
 *           type: string
 *           description: S3 key/path.
 *         originalName:
 *           type: string
 *         mimeType:
 *           type: string
 *         size:
 *           type: integer
 *         viewUrl:
 *           type: string
 *           format: url
 *           description: Temporary secure link to view the media.
 */

// ───────────────────────── Folders ─────────────────────────

/**
 * @swagger
 * /api/media/folders:
 *   post:
 *     summary: Create gallery folder
 *     tags: [Media Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Folder'
 *     responses:
 *       201:
 *         description: Folder created.
 *   get:
 *     summary: List gallery folders
 *     tags: [Media Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [PHOTO, VIDEO]
 *     responses:
 *       200:
 *         description: List of folders.
 */

/**
 * @swagger
 * /api/media/folders/{id}:
 *   patch:
 *     summary: Rename gallery folder
 *     tags: [Media Service]
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
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Folder renamed.
 *   delete:
 *     summary: Delete folder and contents
 *     description: Permanently removes the folder and all its associated photos/videos from S3.
 *     tags: [Media Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Folder deleted.
 */

// ───────────────────────── Media ─────────────────────────

/**
 * @swagger
 * /api/media/gallery/upload-url:
 *   get:
 *     summary: Get S3 upload session
 *     description: Returns a presigned URL to upload a file directly to S3.
 *     tags: [Media Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fileName
 *         required: true
 *       - in: query
 *         name: fileType
 *         required: true
 *         description: MIME type (e.g. image/jpeg, video/mp4)
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Presigned URL generated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     uploadUrl:
 *                       type: string
 *                       format: url
 *                       description: Temporary S3 upload URL.
 *                     key:
 *                       type: string
 *                       description: S3 object key to use when registering the item.
 */

/**
 * @swagger
 * /api/media/gallery/items:
 *   post:
 *     summary: Register uploaded media
 *     description: Finalizes an upload by saving the file metadata and folder linkage to the database.
 *     tags: [Media Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GalleryItem'
 *     responses:
 *       201:
 *         description: Media item registered.
 */

/**
 * @swagger
 * /api/media/gallery/folders/{folderId}/items:
 *   get:
 *     summary: View folder items
 *     description: Lists all photos or videos in a folder with temporary viewable URLs.
 *     tags: [Media Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: folderId
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: List of media items.
 */

/**
 * @swagger
 * /api/media/gallery/items/{id}:
 *   delete:
 *     summary: Delete single media item
 *     tags: [Media Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - $ref: '#/components/parameters/GaushalaIdHeader'
 *     responses:
 *       200:
 *         description: Item deleted.
 */
