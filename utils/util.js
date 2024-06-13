//import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';

// export const hashPassword = async (password) => {
//     try{
//         const hashPassword = await bcrypt.hash(password, 10);
//         return hashPassword;
//     }catch(err){
//         throw new Error(err);
//     }
// }

// export const comparePassword = async (password, hashPassword) => {
//     try{
//         const result = await bcrypt.compare(password, hashPassword);
//         return result;
//     }catch(err){
//         throw new Error(err);
//     }
// }


export const generateToken = async (id) => {
    try{
        const token = JWT.sign({_id:id}, process.env.JWT_SECRET, {
            expiresIn: 864000
        });
        return token;
    }catch(err){
        throw new Error(err);
    }
}

export const decodeToken = async (token) => {
    try{
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        return decoded;
    }catch(err){
        throw new Error(err);
    }
}