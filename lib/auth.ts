import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server'; //Next's request object, which gives access to cookies

//jwt consists of 3 parts : header, payload, signature -> header + payload + secret_key = signature
//jwt.verify(token, secret_key) -> token is decoded into header and payload and is combined with secret_key passed into the func and generates a brand new signature
//this brand new signature is compared with the original signature that arrived with the token

//getting the secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

//creating an interface for what will be contained inside jwt payload
interface JwtPayload {
    userId: string;
}

//function to create tokens while login/registration
//Create a token containing e.g., { userId: "12345" }, sign it with my secret key, and make it valid for 7 days.
export function signToken(userId: string){
    return jwt.sign({userId}, JWT_SECRET, { expiresIn: '7d' })
}

//function to verify and decode incoming tokens
export function verifyToken(token: string){
    try {
        return jwt.verify(token,JWT_SECRET) as JwtPayload
    } catch (error) {
        return null
    }
}

//function to get the current authenticated user inside API routes
export function getAuthUser(req: NextRequest){
    const token = req.cookies.get('token')?.value
    if(!token){
        return null
    }
    const decoded = verifyToken(token);
    return decoded ? decoded.userId : null
}