const isAuthenticated  = async (req, res, next) => {
    if(!req.session.user){
        return res.status(401).send({Message : "Unauthorized"})
    };
    next()
}


module.exports = {
    isAuthenticated    
}