const request = require('supertest');
const app = require('../../app');
const { 
    mongoConnect,
    mongoDisconnect,
 } = require('../../services/mongo');

describe('Test Launch API', ()=> {
    beforeAll(async () => {
        await mongoConnect();
    });

    afterAll(async () => {
        console.log('in after all');
        await mongoDisconnect();
    });

    describe('Test GET /v1/launches', () => {
        test('It should respond with 200 success', async () => {
            const response = await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/)
                .expect(200);
        });
    });
    
    describe('Test POST /v1/launch', () => {
        const completeLaunchData = {
            mission: 'USS',
            rocket: 'A rocket',
            target: 'Kepler-1649 b',
            launchDate: '2028-10-11',
        }
        const launchDataWithoutDate = {
            mission: 'USS',
            rocket: 'A rocket',
            target: 'Kepler-1649 b',     
        }
    
        const validationResponse = {
            error: 'Missing required launch property',
        }
    
        test('It should respond with 201 created', async () => {
            const response = await request(app)
            .post('/v1/launches')
            .send(completeLaunchData)
            .expect('Content-Type', /json/)
            .expect(201);
            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(response.body).toMatchObject(launchDataWithoutDate);
            expect(responseDate).toBe(requestDate);
        });
    
        test('It should catch missing properties', async () => {
            const response = await request(app)
            .post('/v1/launches')
            .send(launchDataWithoutDate)
            .expect('Content-Type', /json/)
            .expect(400);
    
            expect(response.body).toStrictEqual(validationResponse);
        });
    });
});