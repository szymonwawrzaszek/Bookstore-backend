const should = require("chai").should();

const authMiddleware = require('../middleware/is_auth');

it("should throw error when authorization header is not found", () => {
    const req = {
        get: () => null
    }
    const isAuth = () => authMiddleware(req)
    
    isAuth.should.Throw('Not authenticated.').and.have.property('statusCode', 401)
})

it("should not throw error when authorization header is found", () => {
    // arrange
    const req = {
        get: () => "authenticated"
    }
    const isAuth = () => authMiddleware(req)
    
    // act & assert
    isAuth.should.not.Throw('Not authenticated.')
})