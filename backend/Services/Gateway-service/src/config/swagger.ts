import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Cattle Management System (CMS) API',
            version: '1.0.0',
            description: 'Comprehensive API documentation for all CMS microservices, aggregated via the Gateway.',
        },
        servers: [
            {
                url: process.env.GATEWAY_URL || 'http://localhost:5000',
                description: 'API Gateway',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/docs/*.ts'], // Scan all TS files in the docs folder
};

export const swaggerSpec = swaggerJsdoc(options);
