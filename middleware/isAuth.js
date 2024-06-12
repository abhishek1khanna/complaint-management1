import jwt from 'jsonwebtoken';


export const isAuth = async (req, res, next) => {

    try{
        const token = req.headers.authorization.split(' ')[1];
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        req.encodedUser = decoded;
        next();
    }catch(err){
        return res.status(400).send({message:"error in token",status:"failed",statusCode:400,errorMessage:err});
     
        // res.status(401).send({message: 'Invalid token'});
        //const errormsg = new Error(err.message);
        //errormsg.statusCode = 401;
        //next(errormsg);
    }

}