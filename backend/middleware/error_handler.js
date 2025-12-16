export default function (error, req, res, next){
    res.status(500).json({
        message: error.message,
        stack: error.stack,
    })
}